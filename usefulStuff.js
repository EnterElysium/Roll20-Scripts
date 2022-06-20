// this object will later be accessible globally
const Namespaced = (function() {
    // whatever is only needed in this current file goes here!
    const VERY_IMPORTANT_CONST = "Foo";
    function handle_apocalypse(emergency_code) {
      //...
    }
    
    // globally registered event handlers should also work here (YMMV, check!)
    on("ready", function() {
      // take over the world!
    })
    
    // This object defines everything that will be copied into the globally accesible object.
    // Anything NOT in here is only accessible inside this "namespace"
    const return_object = {
      "name": "Namespaced_stuff", "version": "0.0.0", "halt_and_catch_fire": handle_apocalypse
    }
    
    return return_object
  })()