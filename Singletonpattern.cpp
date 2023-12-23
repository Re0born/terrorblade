#include <iostream>

class Singleton {
public:
    // Глобальна точка доступу до єдиного екземпляра
    static Singleton& getInstance() {
        static Singleton instance; // Ліниве ініціалізація
        return instance;
    }

    // Інші методи та дані класу
    void someMethod() {
        std::cout << "Singleton method called." << std::endl;
    }

    // Забороняємо копіювання та присвоєння
    Singleton(const Singleton&) = delete;
    Singleton& operator=(const Singleton&) = delete;

private:
    // Приватний конструктор та деструктор для запобігання створенню більше одного екземпляра
    Singleton() {}
    ~Singleton() {}
};

int main() {
    // Використання єдиного екземпляра
    Singleton& singleton = Singleton::getInstance();
    singleton.someMethod();

    // Спроба створити другий екземпляр
    // Singleton anotherInstance; // Це викличе помилку компіляції, оскільки конструктор приватний

    return 0;
}
