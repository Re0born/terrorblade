#include <iostream>

// Абстракція
class Abstraction {
public:
    virtual void operation() const = 0;
    virtual ~Abstraction() {}
};

// Реалізація
class Implementation {
public:
    virtual void performOperation() const = 0;
    virtual ~Implementation() {}
};

// Конкретна реалізація 1
class ConcreteImplementation1 : public Implementation {
public:
    void performOperation() const override {
        std::cout << "Concrete Implementation 1" << std::endl;
    }
};

// Конкретна реалізація 2
class ConcreteImplementation2 : public Implementation {
public:
    void performOperation() const override {
        std::cout << "Concrete Implementation 2" << std::endl;
    }
};

// Конкретна абстракція
class RefinedAbstraction : public Abstraction {
public:
    RefinedAbstraction(Implementation* implementation) : implementation_(implementation) {}

    void operation() const override {
        implementation_->performOperation();
    }

private:
    Implementation* implementation_;
};

int main() {
    // Використання паттерна Міст
    Implementation* impl1 = new ConcreteImplementation1();
    Abstraction* abstraction1 = new RefinedAbstraction(impl1);
    abstraction1->operation();

    // Зміна реалізації без зміни абстракції
    Implementation* impl2 = new ConcreteImplementation2();
    Abstraction* abstraction2 = new RefinedAbstraction(impl2);
    abstraction2->operation();

    // Очищення пам'яті
    delete impl1;
    delete abstraction1;
    delete impl2;
    delete abstraction2;

    return 0;
}
