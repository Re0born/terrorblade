#include <iostream>
#include <string>

// Клас, який представляє складний об'єкт
class Product {
public:
    void addPart(const std::string& part) {
        parts_ += part + " ";
    }

    void show() const {
        std::cout << "Product parts: " << parts_ << std::endl;
    }

private:
    std::string parts_;
};

// Абстрактний будівельник
class Builder {
public:
    virtual void buildPartA() = 0;
    virtual void buildPartB() = 0;
    virtual Product getResult() const = 0;
    virtual ~Builder() {}
};

// Конкретний будівельник для певної конфігурації об'єкта
class ConcreteBuilder : public Builder {
public:
    void buildPartA() override {
        product_.addPart("PartA");
    }

    void buildPartB() override {
        product_.addPart("PartB");
    }

    Product getResult() const override {
        return product_;
    }

private:
    Product product_;
};

// Директор, який визначає порядок конструювання об'єкта
class Director {
public:
    void construct(Builder& builder) {
        builder.buildPartA();
        builder.buildPartB();
    }
};

int main() {
    // Використання паттерна Будівельник
    ConcreteBuilder builder;
    Director director;
    
    // Конструювання об'єкта за допомогою директора і будівельника
    director.construct(builder);
    
    // Отримання результату від будівельника
    Product product = builder.getResult();

    // Виведення результату
    product.show();

    return 0;
}
