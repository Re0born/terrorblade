#include <iostream>
#include <string>

// Абстрактний клас продукту А
class AbstractProductA {
public:
    virtual void displayInfo() const = 0;
    virtual ~AbstractProductA() {}
};

// Конкретний продукт А1
class ConcreteProductA1 : public AbstractProductA {
public:
    void displayInfo() const override {
        std::cout << "Concrete Product A1" << std::endl;
    }
};

// Конкретний продукт А2
class ConcreteProductA2 : public AbstractProductA {
public:
    void displayInfo() const override {
        std::cout << "Concrete Product A2" << std::endl;
    }
};

// Абстрактний клас продукту B
class AbstractProductB {
public:
    virtual void displayInfo() const = 0;
    virtual ~AbstractProductB() {}
};

// Конкретний продукт B1
class ConcreteProductB1 : public AbstractProductB {
public:
    void displayInfo() const override {
        std::cout << "Concrete Product B1" << std::endl;
    }
};

// Конкретний продукт B2
class ConcreteProductB2 : public AbstractProductB {
public:
    void displayInfo() const override {
        std::cout << "Concrete Product B2" << std::endl;
    }
};

// Абстрактна фабрика
class AbstractFactory {
public:
    virtual AbstractProductA* createProductA() const = 0;
    virtual AbstractProductB* createProductB() const = 0;
    virtual ~AbstractFactory() {}
};

// Конкретна фабрика 1
class ConcreteFactory1 : public AbstractFactory {
public:
    AbstractProductA* createProductA() const override {
        return new ConcreteProductA1();
    }

    AbstractProductB* createProductB() const override {
        return new ConcreteProductB1();
    }
};

// Конкретна фабрика 2
class ConcreteFactory2 : public AbstractFactory {
public:
    AbstractProductA* createProductA() const override {
        return new ConcreteProductA2();
    }

    AbstractProductB* createProductB() const override {
        return new ConcreteProductB2();
    }
};

int main() {
    // Використання абстрактної фабрики
    AbstractFactory* factory1 = new ConcreteFactory1();
    AbstractProductA* productA1 = factory1->createProductA();
    AbstractProductB* productB1 = factory1->createProductB();

    productA1->displayInfo();
    productB1->displayInfo();

    delete productA1;
    delete productB1;
    delete factory1;

    AbstractFactory* factory2 = new ConcreteFactory2();
    AbstractProductA* productA2 = factory2->createProductA();
    AbstractProductB* productB2 = factory2->createProductB();

    productA2->displayInfo();
    productB2->displayInfo();

    delete productA2;
    delete productB2;
    delete factory2;

    return 0;
}
