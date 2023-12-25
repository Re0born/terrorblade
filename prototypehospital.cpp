#include <iostream>
#include <string>
#include <unordered_map>

class Hospital {
public:
    virtual ~Hospital() {}

    virtual Hospital* clone() const = 0;

    virtual void display() const = 0;
};

class GeneralHospital : public Hospital {
private:
    std::string hospitalType;

public:
    GeneralHospital(std::string type) : hospitalType(type) {}

    Hospital* clone() const override {
        return new GeneralHospital(*this);
    }

    void display() const override {
        std::cout << "General Hospital of type: " << hospitalType << std::endl;
    }
};

class PediatricHospital : public Hospital {
private:
    std::string hospitalType;

public:
    PediatricHospital(std::string type) : hospitalType(type) {}

    Hospital* clone() const override {
        return new PediatricHospital(*this);
    }

    void display() const override {
        std::cout << "Pediatric Hospital of type: " << hospitalType << std::endl;
    }
};

class HospitalPrototypeFactory {
private:
    std::unordered_map<std::string, Hospital*> prototypes;

public:
    Hospital* getPrototype(const std::string& type) {
        return prototypes[type]->clone();
    }

    void addPrototype(const std::string& type, Hospital* prototype) {
        prototypes[type] = prototype;
    }
};

int main() {
    HospitalPrototypeFactory factory;

    GeneralHospital generalPrototype("General");
    PediatricHospital pediatricPrototype("Pediatric");

    factory.addPrototype("General", &generalPrototype);
    factory.addPrototype("Pediatric", &pediatricPrototype);

    // Create new hospitals using prototypes
    Hospital* newGeneralHospital = factory.getPrototype("General");
    Hospital* newPediatricHospital = factory.getPrototype("Pediatric");

    // Display the created hospitals
    newGeneralHospital->display();
    newPediatricHospital->display();

    // Clean up
    delete newGeneralHospital;
    delete newPediatricHospital;

    return 0;
}
