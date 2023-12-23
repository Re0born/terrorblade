#include <iostream>
#include <string>

// Абстрактний клас Прототипу
class Prototype {
public:
    virtual Prototype* clone() const = 0;
    virtual void displayInfo() const = 0;
    virtual ~Prototype() {}
};

// Конкретний клас Прототипу
class ConcretePrototype : public Prototype {
public:
    ConcretePrototype(int value, std::string text) : value_(value), text_(text) {}

    // Конструктор копіювання
    ConcretePrototype(const ConcretePrototype& other) : value_(other.value_), text_(other.text_) {}

    // Метод копіювання
    Prototype* clone() const override {
        return new ConcretePrototype(*this);
    }

    void displayInfo() const override {
        std::cout << "Value: " << value_ << ", Text: " << text_ << std::endl;
    }

private:
    int value_;
    std::string text_;
};

int main() {
    // Створення оригінального об'єкту
    ConcretePrototype original(42, "Hello, Prototype!");

    // Копіювання об'єкту за допомогою Прототипу
    Prototype* clone = original.clone();

    // Виведення інформації про оригінал і клон
    std::cout << "Original: ";
    original.displayInfo();

    std::cout << "Clone: ";
    clone->displayInfo();

    // Очищення пам'яті
    delete clone;

    return 0;
}
