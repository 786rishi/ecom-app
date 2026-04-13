package com.example.productcatalogservice.config;

import org.apache.http.HttpHost;
import org.opensearch.client.RestHighLevelClient;
import org.opensearch.client.RestClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenSearchConfig {


    @Value("${spring.elasticsearch.uris}")
    private String opensearchHost;

    @Bean
    public RestHighLevelClient client() {
        return new RestHighLevelClient(
                RestClient.builder(
                        new HttpHost(opensearchHost, 9200, "http")
                )
        );
    }
}