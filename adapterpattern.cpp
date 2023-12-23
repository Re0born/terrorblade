#include <iostream>

// Інтерфейс, який несумісний з іншим класом
class IncompatibleInterface {
public:
    virtual void specificRequest() const {
        std::cout << "Specific Request" << std::endl;
    }

    virtual ~IncompatibleInterface() {}
};

// Інтерфейс, який очікує клас, з яким несумісний перший
class TargetInterface {
public:
    virtual void request() const = 0;
    virtual ~TargetInterface() {}
};

// Адаптер, який адаптує перший інтерфейс до другого
class Adapter : public TargetInterface {
public:
    Adapter(IncompatibleInterface* adaptee) : adaptee_(adaptee) {}

    void request() const override {
        adaptee_->specificRequest();
    }

private:
    IncompatibleInterface* adaptee_;
};

// Клас, який використовує інтерфейс Target
class Client {
public:
    void useTarget(TargetInterface* target) {
        target->request();
    }
};

int main() {
    // Створення об'єкта з несумісним інтерфейсом
    IncompatibleInterface* adaptee = new IncompatibleInterface;

    // Створення адаптера
    TargetInterface* adapter = new Adapter(adaptee);

    // Використання клієнтом інтерфейсу Target
    Client client;
    client.useTarget(adapter);

    // Очищення пам'яті
    delete adaptee;
    delete adapter;

    return 0;
}
