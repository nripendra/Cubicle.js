Cubicle.js
==========

A small light-weight javascript library for defining modular components, 3kb unminimized (93 loc) as of Dec 9 - 2014.

# Getting Started

A cubicle is a small container that provides certain amount of privacy. Defining a cubicle is as easy as this:

```Javascript
Cubicle(function(invite, announce){
  
});
```
Just call 'Cubicle' function, and pass an anonymouse function as shown above. The annonymous function gets two helper functions as the parameter: invite and announce. The 'invite' function can be used to get hold of worker in other cubicles, provided that the worker in other cubicle has announced itself.

## What is a worker?
A worker is the main module that works inside the cubicle. The worker is the main thing that does the actual work. A worker can have 'init' method, for the purpose of constructor. And the annonymous function should always return the worker, e.g:

```Javascript
Cubicle(function(invite, announce){
  var worker = {
    "init": function(){
        // this is the constructor..
    }
  };
  
  return worker;
});
```
## Announcing a worker
In a normal situation worker cannot work alone, it will require help from other workers, and it needs to help others in return. The way for worker to announce that it is available for helping others is to announce itself, as shown here:

```Javascript
Cubicle(function(invite, announce){
  var worker = {
    "init": function(){
        // this is the constructor..
    },
    sayHi: function(){
        alert("Hi!!");
    }
  };
  
  return announce("worker1", worker);
});
```
Note that we are returning as soon as calling announce, it is possible because announce returns worker instance once it has registered the worker in list of available workers.

## Inviting a worker
As mentioned earlier one worker alone may not be able to do all the work, so it needs to invite worker in other cubicle for help. Here's and example which calls worker1 above inside another cubicle.

```Javascript
Cubicle(function(invite, announce){
  var worker = {
    "init": function(){
        var helper = invite("worker1");
        helper.sayHi();
    }
  };
  
  return announce("worker2", worker);
});
```
It is very important to notice that both cubicles never messes with global namespace (window object in case of browser), the main idea behind cubicle is to provide this isolation, while modules are able to cooperate with each other.

## But I want to mess the global namespace :P

Absolutely!! Some times we may want to create Cubicle that is not all pervasive, i.e. allow the module (worker) to be available anywhere out side Cubicles. Just pass true as the last parameter in announce, like this:

```Javascript
Cubicle(function(invite, announce){
  var worker = {
    "init": function(){
        
    },
    doWork: function(){
        alert("phew!!");
    }
  };
  
  return announce("globalWorker", worker, true);
});

globalWorker.doWork();
```
As, shown above globalWorker is announced in global context (by passing true as last parameter). Hence, 'globalWorker' now becomes a global variable that doesn't require inviting.

# License
This library is released under [MIT](https://github.com/nripendra/Cubicle.js/blob/master/LICENSE) license.
