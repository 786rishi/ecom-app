package com.example.productcatalogservice.service;

import com.example.productcatalogservice.exception.ProductNotFoundException;
import com.example.productcatalogservice.model.Product;
import com.example.productcatalogservice.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.opensearch.action.index.IndexRequest;
import org.opensearch.action.search.SearchRequest;
import org.opensearch.action.search.SearchResponse;
import org.opensearch.client.RequestOptions;
import org.opensearch.client.RestHighLevelClient;
import org.opensearch.index.query.QueryBuilders;
import org.opensearch.script.Script;
import org.opensearch.script.ScriptType;
import org.opensearch.search.SearchHit;
import org.opensearch.search.builder.SearchSourceBuilder;
import org.opensearch.search.sort.ScriptSortBuilder;
import org.opensearch.search.sort.SortBuilders;
import org.opensearch.search.sort.SortOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository repository;
    private final RestHighLevelClient restHighLevelClient;
    private final ObjectMapper objectMapper;
  //  private final ProductSearchRepository searchRepository;
   // private final ElasticsearchOperations elasticsearchOperations;

    public ProductService(ProductRepository repository, RestHighLevelClient restHighLevelClient,
                          ObjectMapper objectMapper){
        this.repository = repository;
        this.restHighLevelClient = restHighLevelClient;
        this.objectMapper = objectMapper;
    }

//    public Product create(Product product) {
//        product.setCreatedAt(LocalDateTime.now());
//        product.setUpdatedAt(LocalDateTime.now());
//        product.setActive(true);
//        return repository.save(product);
//    }

    public Product create(Product product) throws IOException {
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        product.setActive(true);
        Product saved = repository.save(product);

        // 🔥 sync to ES
        indexProduct(product);

        return saved;
    }

    public void indexProduct(Product product) throws IOException {

//        IndexRequest request = new IndexRequest("products")
//                .id(product.getId())
//                .source(
//                        objectMapper.writeValueAsString(product),
//                        XContentType.JSON
//                );
//
//        restHighLevelClient.index(request, RequestOptions.DEFAULT);

        Map<String, Object> jsonMap = new HashMap<>();

        jsonMap.put("name", product.getName());
        jsonMap.put("description", product.getDescription());
        jsonMap.put("category", product.getCategory());

        // 🔥 ADD THESE
        jsonMap.put("featured", product.getFeatured());
        jsonMap.put("featureStart", product.getFeatureStart() != null ? product.getFeatureStart().toString(): null);
        jsonMap.put("featureEnd",  product.getFeatureEnd() != null ?  product.getFeatureEnd().toString(): null);

        IndexRequest request = new IndexRequest("products")
                .id(product.getId())
                .source(jsonMap);

        restHighLevelClient.index(request, RequestOptions.DEFAULT);
    }
//
//    private ProductDocument mapToDocument(Product product) {
//        ProductDocument doc = new ProductDocument();
//        doc.setId(product.getId());
//        doc.setName(product.getName());
//        doc.setDescription(product.getDescription());
//        doc.setCategory(product.getCategory());
//        doc.setPrice(product.getPrice());
//        return doc;
//    }

    public Page<Product> getAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Product getById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));
    }

    public List<Product> getByCategory(String category) {
        return repository.findByCategoryAndActiveTrue(category);
    }

//    public List<Product> search(String keyword) {
//        return repository.searchByText(keyword);
//    }


//    public Page<Product> search(String keyword, Pageable pageable) {
//        if (keyword == null || keyword.isEmpty()) {
//            return repository.findAll(pageable);
//        }
//        return repository.searchByText(keyword, pageable);  // ✅ Correct usage
//    }
//
//


    public List<Product> search(String keyword, Pageable pageable) throws IOException {

        SearchRequest searchRequest = new SearchRequest("products");

        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
        sourceBuilder.query(
                QueryBuilders.multiMatchQuery(
                        keyword,
                        "name",
                        "description",
                        "category"
                )
        ).from(pageable.getPageNumber() * pageable.getPageSize())
                .size(pageable.getPageSize());

        long now = System.currentTimeMillis();

        Map<String, Object> map = new HashMap<>();
        map.put("now", now);

        // 🔥 FEATURED FIRST LOGIC
//        sourceBuilder.sort(
//                SortBuilders.scriptSort(
//                        new Script(
//                                ScriptType.INLINE,
//                                "painless",
//                                "if (doc['featureStart'].size()!=0 && doc['featureEnd'].size()!=0 && doc['featureStart'].value.toInstant().toEpochMilli() <= params.now && doc['featureEnd'].value.toInstant().toEpochMilli() >= params.now) { return 1 } else { return 0 }",
//                                map),
//                        ScriptSortBuilder.ScriptSortType.NUMBER
//                ).order(SortOrder.DESC)
//        );

        // Optional: secondary sort (relevance)
      //  sourceBuilder.sort("_score", SortOrder.DESC);

        sourceBuilder.sort("featured", SortOrder.DESC);

        searchRequest.source(sourceBuilder);

        SearchResponse response =
                restHighLevelClient.search(searchRequest, RequestOptions.DEFAULT);

        List<Product> result = new ArrayList<>();

        for (SearchHit hit : response.getHits()) {
            Product product = objectMapper
                    .readValue(hit.getSourceAsString(), Product.class);
            result.add(product);
        }

        return result;
    }

//    public Page<ProductDocument> search(String keyword, Pageable pageable) {
//
//        NativeQuery query = NativeQuery.builder()
//                .withQuery(q -> q.multiMatch(m -> m
//                        .query(keyword)
//                        .fields("name", "description", "category")
//                ))
//                .withPageable(pageable)
//                .build();
//
//        SearchHits<ProductDocument> hits =
//                elasticsearchOperations.search(query, ProductDocument.class);
//
//        List<ProductDocument> content = hits.stream()
//                .map(hit -> hit.getContent()).collect(Collectors.toList());
//
//        return new PageImpl<>(content, pageable, hits.getTotalHits());
//    }


//    public List<Product> search(String keyword) {
//        return repository.findByNameContainingIgnoreCase(keyword);
//    }

    public Product update(String id, Product updated) {
        Product existing = getById(id);

        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setCategory(updated.getCategory());
        existing.setAttributes(updated.getAttributes());
        existing.setImages(updated.getImages());
        existing.setUpdatedAt(LocalDateTime.now());

        return repository.save(existing);
    }

    public void delete(String id) {
        Product product = getById(id);
        product.setActive(false); // soft delete
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

    private boolean isCurrentlyFeatured(Product p) {

        LocalDateTime now = LocalDateTime.now();

        return p.getFeatureStart() != null
                && p.getFeatureEnd() != null
                && now.isAfter(p.getFeatureStart())
                && now.isBefore(p.getFeatureEnd());
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
}