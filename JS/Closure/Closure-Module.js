const Person = (function() {
  let person = {
    name: "",
    age: 0
  };

  function setName(personName) {
    person.name = personName;
  }

  function setAge(personAge) {
    person.age = personAge;
  }

  function getPerson() {
    return person.name + " " + person.age;
  }

  return {
    setName: setName,
    setAge: setAge,
    getPerson: getPerson
  };
})();
// console.log(Person);一个对象
console.log(Person.person); // undefined
Person.setName("Linbudu");
Person.setAge(21);
const newPerson = Person.getPerson();
console.log(newPerson); // Linbudu 21
