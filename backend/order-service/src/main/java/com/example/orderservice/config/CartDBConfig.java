package com.example.orderservice.config;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableJpaRepositories(
        basePackages = "com.example.orderservice.repository.cart",
        entityManagerFactoryRef = "cartEntityManager",
        transactionManagerRef = "cartTransactionManager"
)
public class CartDBConfig {

    @Bean
    @ConfigurationProperties("spring.datasource.cart")
    public DataSourceProperties cartDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    public DataSource cartDataSource() {
        return cartDataSourceProperties()
                .initializeDataSourceBuilder()
                .build();
    }

    @Bean
    public LocalContainerEntityManagerFactoryBean cartEntityManager(
            EntityManagerFactoryBuilder builder) {

        Map<String, Object> properties = new HashMap<>();
        properties.put("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");
        properties.put("hibernate.hbm2ddl.auto", "update");
        properties.put("hibernate.show_sql", true);

        return builder
                .dataSource(cartDataSource())
                .packages("com.example.orderservice.entity.cart")
                .persistenceUnit("cart")
                .properties(properties)
                .build();
    }

    @Bean
    public PlatformTransactionManager cartTransactionManager(
            @Qualifier("cartEntityManager") EntityManagerFactory emf) {
        return new JpaTransactionManager(emf);
    }
}
