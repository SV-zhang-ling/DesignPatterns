#include "DogBuilder.h"

DogWeightBuilder DogBaseBuilder::weightAttri() const 
{ 
	return DogWeightBuilder(dog); 
};

DogColorBuilder DogBaseBuilder::colorAttri() const 
{ 
	return DogColorBuilder(dog); 
}

