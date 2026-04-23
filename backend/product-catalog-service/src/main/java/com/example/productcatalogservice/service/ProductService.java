package com.example.productcatalogservice.service;

import com.example.productcatalogservice.client.InventoryClient;
import com.example.productcatalogservice.dto.ProductSearchRequest;
import com.example.productcatalogservice.exception.ProductNotFoundException;
import com.example.productcatalogservice.model.Product;
import com.example.productcatalogservice.model.ProductTestimonial;
import com.example.productcatalogservice.repository.ProductRepository;
import org.opensearch.common.unit.Fuzziness;
import org.opensearch.index.query.*;
import org.opensearch.index.query.MoreLikeThisQueryBuilder.Item;
import com.example.productcatalogservice.repository.ProductTestimonialRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.opensearch.action.index.IndexRequest;
import org.opensearch.action.search.SearchRequest;
import org.opensearch.action.search.SearchResponse;
import org.opensearch.client.RequestOptions;
import org.opensearch.client.RestHighLevelClient;
import org.opensearch.index.query.MoreLikeThisQueryBuilder;
import org.opensearch.index.query.QueryBuilders;
import org.opensearch.search.SearchHit;
import org.opensearch.search.builder.SearchSourceBuilder;
import org.opensearch.search.sort.SortOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
public class ProductService {

    private final ProductRepository repository;
    private final RestHighLevelClient restHighLevelClient;
    private final ObjectMapper objectMapper;
    private final InventoryClient inventoryClient;
    private final ProductTestimonialRepository testimonialRepository;


    public Product create(Product product) throws IOException {
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        product.setActive(true);
        Product saved = repository.save(product);

        // sync to ES
        indexProduct(saved);

        inventoryClient.add(saved.getId(), product.getAvailableQuantity());

        return saved;
    }

    public List<Product> loadProducts(List<Product> products) {

        products.forEach(product -> {
            product.setCreatedAt(LocalDateTime.now());
            product.setUpdatedAt(LocalDateTime.now());
            product.setActive(true);
        });

        List<Product> saved = repository.saveAll(products);

        // 🔥 sync to ES
        saved.forEach(product -> {
            try {
                indexProduct(product);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            inventoryClient.add(product.getId(), product.getAvailableQuantity());
        });

        return saved;
    }


    public void indexProduct(Product product) throws IOException {
        Map<String, Object> jsonMap = new HashMap<>();

        jsonMap.put("name", product.getName());
        jsonMap.put("id", product.getId());
        jsonMap.put("description", product.getDescription());
        jsonMap.put("category", product.getCategory());

        jsonMap.put("price", product.getPrice());
        jsonMap.put("active", product.getActive());

        jsonMap.put("inStock", product.getAvailableQuantity() > 0);
        jsonMap.put("availableQuantity", product.getAvailableQuantity());

        jsonMap.put("attributes", product.getAttributes());
        jsonMap.put("image", product.getImage());

        if (product.getFeatured() != null) {
            jsonMap.put("featured", product.getFeatured());
        }

        if (product.getFeatureStart() != null) {
            jsonMap.put("featureStart", product.getFeatureStart().toString());
        }

        if (product.getFeatureEnd() != null) {
            jsonMap.put("featureEnd", product.getFeatureEnd().toString());
        }

        if (product.getCreatedAt() != null) {
            jsonMap.put("createdAt", product.getCreatedAt().toString());
        }

        IndexRequest request = new IndexRequest("products")
                .id(product.getId())
                .source(jsonMap);

        restHighLevelClient.index(request, RequestOptions.DEFAULT);
    }

    public Page<Product> getAll(Pageable pageable) {
        return repository.findByActiveTrue(pageable);
    }

    public Product getById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));
    }

    public List<Product> getByIds(List<String> id) {
        return repository.findAllById(id);
    }

    public List<Product> getByCategory(String category) {
        return repository.findByCategoryAndActiveTrue(category);
    }



    public Page<Product> search(String keyword, Pageable pageable) throws IOException {

        SearchRequest searchRequest = new SearchRequest("products");

        if(keyword.equals("featured")) {

            SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();

            BoolQueryBuilder query = QueryBuilders.boolQuery()
                    .must(QueryBuilders.termQuery("active", true))
                    .must(QueryBuilders.termQuery("featured", true))
                    .filter(QueryBuilders.rangeQuery("featureStart").lte("now"))
                    .filter(QueryBuilders.rangeQuery("featureEnd").gte("now"));

            sourceBuilder.query(query).from(pageable.getPageNumber() * pageable.getPageSize())
                    .size(pageable.getPageSize());;

            searchRequest.source(sourceBuilder);

            SearchResponse response = restHighLevelClient.search(searchRequest, RequestOptions.DEFAULT);

            List<Product> result = new ArrayList<>();

            for (SearchHit hit : response.getHits()) {
                Product product = objectMapper
                        .readValue(hit.getSourceAsString(), Product.class);
                result.add(product);
            }

            long totalHits = response.getHits().getTotalHits().value;

            return new PageImpl<>(result, pageable, totalHits);
        }


        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();

        BoolQueryBuilder query = QueryBuilders.boolQuery()

                .should(QueryBuilders.multiMatchQuery(
                                keyword,
                                "name",
                                "description",
                                "category"
                        )
                        .fuzziness(Fuzziness.AUTO)
                        .prefixLength(1)          // improves fuzzy quality
                        .operator(Operator.OR)
                        .boost(2.0f))             // give it weight

                // 🔹 Prefix match (handles partial like "salw")
                .should(QueryBuilders.multiMatchQuery(
                                keyword,
                                "name",
                                "description",
                                "category"
                        )
                        .type(MultiMatchQueryBuilder.Type.PHRASE_PREFIX)
                        .boost(3.0f));            // higher priority

        sourceBuilder.query(query)
                .from(pageable.getPageNumber() * pageable.getPageSize())
                .size(pageable.getPageSize())
                .sort("_score", SortOrder.DESC);

        long now = System.currentTimeMillis();

        Map<String, Object> map = new HashMap<>();
        map.put("now", now);

        searchRequest.source(sourceBuilder);

        SearchResponse response =
                restHighLevelClient.search(searchRequest, RequestOptions.DEFAULT);

        List<Product> result = new ArrayList<>();

        for (SearchHit hit : response.getHits()) {
            Product product = objectMapper
                    .readValue(hit.getSourceAsString(), Product.class);
            result.add(product);
        }

        long totalHits = response.getHits().getTotalHits().value;

        return new PageImpl<>(result, pageable, totalHits);
    }

    public Product update(String id, Product updated) {
        Product existing = getById(id);

        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setCategory(updated.getCategory());
        existing.setAttributes(updated.getAttributes());
        existing.setImage(updated.getImage());
        existing.setUpdatedAt(LocalDateTime.now());

        return repository.save(existing);
    }

    public void delete(String id) {
        Product product = getById(id);
        product.setActive(false); // soft delete

        try {
            indexProduct(product);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        repository.save(product);
    }

    public Product markAsFeatured(String id, String start, String end) {

        Product product = getById(id);

        LocalDateTime startTime = LocalDateTime.parse(start);
        LocalDateTime endTime = LocalDateTime.parse(end);

        product.setFeatureStart(startTime);
        product.setFeatureEnd(endTime);
        product.setFeatured(true);

        Product saved = repository.save(product);

        // sync to OpenSearch
        try {
            indexProduct(saved);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return saved;
    }


    public void updateInventory(String productId, int availableQuantity) throws IOException {

        Product product = repository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setAvailableQuantity(availableQuantity);
        product.setInStock(availableQuantity > 0);

        repository.save(product);

        // 🔥 also reindex for search
        indexProduct(product);
    }

    public Page<Product> searchProducts(ProductSearchRequest request) throws IOException {

        SearchRequest searchRequest = new SearchRequest("products");
        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();

        BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();

        if (request.getKeyword() != null) {
            boolQuery.must(QueryBuilders.multiMatchQuery(
                    request.getKeyword(),
                    "name", "description", "category"
            ).fuzziness(Fuzziness.AUTO));
        }

        // 🧠 Filters
        if (request.getInStock() != null) {
            boolQuery.filter(QueryBuilders.termQuery("inStock", request.getInStock()));
        }

        if (request.getBrand() != null) {
            boolQuery.filter(QueryBuilders.termQuery("attributes.brand", request.getBrand()));
        }

        if (request.getColor() != null) {
            boolQuery.filter(QueryBuilders.termQuery("attributes.color", request.getColor()));
        }

        if (request.getMinPrice() != null || request.getMaxPrice() != null) {
            RangeQueryBuilder priceRange = QueryBuilders.rangeQuery("price");

            if (request.getMinPrice() != null)
                priceRange.gte(request.getMinPrice());

            if (request.getMaxPrice() != null)
                priceRange.lte(request.getMaxPrice());

            boolQuery.filter(priceRange);
        }

        if (request.getMinRating() != null) {
            boolQuery.filter(QueryBuilders.rangeQuery("attributes.rating")
                    .gte(request.getMinRating()));
        }

        // 📊 Sorting
        if (request.getSortBy() != null) {
            SortOrder order = "asc".equalsIgnoreCase(request.getSortOrder())
                    ? SortOrder.ASC : SortOrder.DESC;

            sourceBuilder.sort(request.getSortBy(), order);
        }

        // 📄 Pagination
        sourceBuilder.from(request.getPage() * request.getSize());
        sourceBuilder.size(request.getSize());

        sourceBuilder.query(boolQuery);
        sourceBuilder.trackTotalHits(true);

        searchRequest.source(sourceBuilder);

        SearchResponse response =  restHighLevelClient.search(searchRequest, RequestOptions.DEFAULT);

        List<Product> result = new ArrayList<>();

        for (SearchHit hit : response.getHits()) {
            Product product = objectMapper
                    .readValue(hit.getSourceAsString(), Product.class);
            result.add(product);
        }

        long totalHits = response.getHits().getTotalHits().value;

        return new PageImpl<>(result, PageRequest.of(request.getPage(), request.getSize()), totalHits);
    }

    public List<ProductTestimonial> getProductTestimonial(String productId) {
        return testimonialRepository.findByProductIdAndApprovedTrue(productId);
    }

    public ProductTestimonial addProductTestimonial(ProductTestimonial productTestimonial) {
        repository.findById(productTestimonial.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return testimonialRepository.save(productTestimonial);
    }

    public List<String> searchRelatedProductIds(String productId, String category) {

        try {
            SearchRequest searchRequest = new SearchRequest("products");

            // 🔥 Bool Query
            BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();

            // 🔥 more_like_this (core similarity)
            MoreLikeThisQueryBuilder mltQuery = QueryBuilders.moreLikeThisQuery(
                            new String[]{"name", "description"},
                            null,
                            new Item[]{new Item("products", productId)}
                    )
                    .minTermFreq(1)
                    .minDocFreq(1);

            boolQuery.must(mltQuery);

            // 🔥 filters
            boolQuery.filter(QueryBuilders.termQuery("category.keyword", category));
            boolQuery.filter(QueryBuilders.termQuery("active", true));
            boolQuery.filter(QueryBuilders.termQuery("inStock", true));

            // 🔥 exclude same product
            boolQuery.mustNot(QueryBuilders.termQuery("_id", productId));

            // 🔥 Search Source
            SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
            sourceBuilder.query(boolQuery);
            sourceBuilder.size(6); // limit

            searchRequest.source(sourceBuilder);

            // 🔥 Execute
            SearchResponse response = restHighLevelClient.search(searchRequest, RequestOptions.DEFAULT);

            // 🔥 Extract IDs
            List<String> ids = new ArrayList<>();
            for (SearchHit hit : response.getHits().getHits()) {
                ids.add(hit.getId());
            }

            return ids;

        } catch (Exception e) {
            throw new RuntimeException("Error while fetching related products", e);
        }
    }

    public List<Product> getRelatedProducts(String productId) {

        Product current = repository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // 🔥 OpenSearch call
        List<String> relatedIds = searchRelatedProductIds(productId, current.getCategory());

        // 🔥 fallback (VERY IMPORTANT)
        if (relatedIds.isEmpty()) {
            return repository
                    .findByCategoryAndIdNot(current.getCategory(), productId);
        }

        // 🔥 fetch from DB
        List<Product> products = repository.findAllById(relatedIds);

        return products;
    }

}