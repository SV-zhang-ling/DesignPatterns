#pragma once
#include <string>
#include <iostream>

class Dog
{
	std::string name, weight, color;
public:
	Dog() = default;
	Dog& setName(std::string nam) { name = nam; return *this; }
	Dog& setWeight(std::string weigh) { weight = weigh; return *this; }
	Dog& setColor(std::string clr) { color = clr; return *this; }

	void printInfo() {
		std::cout << "Dog Information, Name: " << name << " Color:" << color << " Weight:" << weight << std::endl;
	}
};

class DogWeightBuilder;
class DogColorBuilder;
class DogBaseBuilder
{
protected:
	Dog& dog;
	explicit DogBaseBuilder(Dog& dog):dog(dog){}
public:
	operator Dog() { return std::move(dog); }

	DogWeightBuilder weightAttri() const;
	DogColorBuilder colorAttri() const;
};

class DogBuilder : public DogBaseBuilder
{
	using Self = DogBuilder;
	//dog is construct at this
	Dog dog;
public:
	explicit DogBuilder() :DogBaseBuilder(dog) {}
	Self& setName(std::string name) { dog.setName(name); return *this; }
	//this Builder is main builder.
};


class DogWeightBuilder : public DogBaseBuilder
{
	using Self = DogWeightBuilder;
public:
	explicit DogWeightBuilder(Dog& dog) :DogBaseBuilder(dog) {}
	Self& setWeight(std::string weigh) {
		dog.setWeight(weigh); 
		return *this;
	}
	//other attribute set interface
};

class DogColorBuilder : public DogBaseBuilder
{
	using Self = DogColorBuilder;
public:
	explicit DogColorBuilder(Dog& dog) :DogBaseBuilder(dog) {}
	Self& setColor(std::string clr) { 
		dog.setColor(clr); 
		return *this;
	}
	//other attribute set interface

};

