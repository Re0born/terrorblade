#include <iostream>
#include <string>

// Інтерфейс для створення продукту
class Product {
public:
    virtual void display() const = 0;
    virtual ~Product() {}
};

// Конкретний продукт
class ConcreteProduct : public Product {
public:
    void display() const override {
        std::cout << "Concrete Product" << std::endl;
    }
};

// Інтерфейс фабрики
class Factory {
public:
    virtual Product* createProduct() const = 0;
    virtual ~Factory() {}
};

// Конкретна фабрика для створення конкретного продукту
class ConcreteFactory : public Factory {
public:
    Product* createProduct() const override {
        return new ConcreteProduct();
    }
};

int main() {
    // Використання фабрики для створення продукту
    Factory* factory = new ConcreteFactory();
    Product* product = factory->createProduct();
    product->display();

    // Очищення пам'яті
    delete product;
    delete factory;

    return 0;
}
