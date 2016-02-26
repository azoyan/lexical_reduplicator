/// @file Animation.js
/// @author Igor Sysoev
/// Check latest version at https://github.com/ho-holic/anijs

/// @namespace Animation
/// Module for animation on elements
var Animation = {  
  
  /// @function linearInterpolation 
  /// Simple linear interpolation
  /// @param {number} x
  /// @param {number} x0
  /// @param {number} x1
  /// @param {number} y0
  /// @param {number} y1
  /// @return {number} Interpolation in range [y0, y1]
  linearInterpolation: function(x, x0, x1, y0, y1) {
    return y0 + (y1 - y0) * ((x - x0)/(x1 - x0));
  }, 
  
  /// @class World
  /// World with one object falling down (used for simulation)
  /// Using SI System Units. In floats.
  World: function() {

    // private    
    var mAcceleration = 10.0;
    var mVelocity = 0.0;
    var mDistance = 0.0; 

    return {
      /// @function clone
      /// Clones current object
      /// @return {World} Returns copy of an object
      clone: function() {
        var copy = Animation.World();
        copy.setAcceleration(mAcceleration);
        copy.setVelocity(mVelocity);
        copy.setDistance(mDistance);        
        return copy;
      },
      
      /// @function update
      /// Simulate world
      /// @param {float} time Time passed since one simulation
      update: function(time) {
        // v = v0 + a*t
        mVelocity += mAcceleration * time;
        // s = s0 + v*t
        mDistance += mVelocity * time;          
      },

      /// @function setVelocity
      /// Set current velocity
      setVelocity: function(velocity) {
        mVelocity = velocity;
      },

      /// @function setDistance
      /// Set passed distance
      setDistance: function(distance) {
        mDistance = distance;
      },    

      /// @function setAcceleration
      /// Set current acceleration
      setAcceleration: function(acceleration) {
        mAcceleration = acceleration;
      },    
      
      /// @function getDistance
      /// Passed distance
      /// @return {float} Distance in meters
      getDistance: function() { 
        return mDistance; 
      },

      /// @function getVelocity
      /// Current velocity
      /// @return {float} velocity in m/s
      getVelocity: function() {
        return mVelocity;
      },

      /// @function getAcceleration
      /// Current acceleration
      /// @return {float} acceleration in m/(s^2)    
      getAcceleration: function() {
        return mAcceleration;
      }
    };
  },  
  
  /// @class DropEffect
  /// Effect of dropping item down with fading out
  DropEffect: function() {
            
    // private
    var mInitialSimulation = Animation.World();
    var mFullyTransparent = 0.0;  
    var mFullyOpaque = 1.0;      
    var mFramesPerSecond = 24;
    var mAnimationSpeed = 1/50000;  

    var mFallDistance = 500;     
       
    // default clone behaviour
    var mCloneBehaviour = function(element) {
      var elementRect = element.getBoundingClientRect();
      var clone = element.cloneNode(true);
      clone.style.position = 'absolute';
      clone.style.left = (window.scrollX + elementRect.left) + 'px';
      clone.style.top = (window.scrollY + elementRect.top) + 'px';          
      document.body.appendChild(clone);   
      return { 
        element: clone, 
        initialDistance: parseInt(clone.style.top)
      };
    };

    // default cleanup behaviour (when animation ended)
    var mCleanupBehaviour = function(element) {
      element.parentNode.removeChild(element);   
    };

    // default behaviour with one simulation step applied
    var mSimulationStepBehaviour = function(element, simulationData) {
      element.style.top = simulationData.distance + 'px';
      element.style.opacity = simulationData.opacity;      
    };
    
    return {

      /// @function setOpacityGradient
      /// This function controls text fading during animation
      /// Use setOpacityGradient(1.0, 1.0) to disable fading
      /// @param {float} transparent Transparency at the end of animation (max value is 1.0)
      /// @param {float} opaque Transparency at  the begining of animation (min value is 0.0)
      /// You can achive reverse effect when switch values
      setOpacityGradient: function(transparent, opaque) {
        mFullyTransparent = transparent;
        mFullyOpaque = opaque;        
      },

      /// @function setCloneBehaviour
      /// Set clone behaviour for element passed to applyTo() function
      /// @param {function(element){}} f New clone behaviour
      setCloneBehaviour: function(f) {
        mCloneBehaviour = f;
      },

      /// @function setCleanupBehaviour
      /// Set cleanup behaviour for element passed to applyTo() function when animation is over
      /// @param {function(element){}} f New cleanup behaviour
      setCleanupBehaviour: function(f) {
        mCleanupBehaviour = f;
      },

      /// @function setSimulationStepBehaviour
      /// Set simulation step behaviour for element passed to applyTo() function
      /// Behaviour takes extra argument that contains data of simulation
      /// var simulationData = {
      ///   distance: _, 
      ///   opacity : _
      /// };      
      /// @param {function(element, simulationData){}} f New simulation step behaviour
      setSimulationStepBehaviour: function(f) {
        mSimulationStepBehaviour = f;
      },
      
      /// @function setAnimationFramesPerSecond
      /// @param {integer} fps Frames per second (default is 24)  
      /// More fps, more cpu time consumed
      setAnimationFramesPerSecond: function(fps) {
        mFramesPerSecond = fps;        
      },
      
      /// @function setFallDistance
      /// @param {integer} distance How much animation must fall down
      /// Negative value that reverses the animation is not supported yet
      setFallDistance: function(distance) {
        mFallDistance = distance;
      },
      
      /// @function setAnimationSpeed
      /// @param {integer} speed Speed of the animation (default is 50000)
      /// This is transition between World configuration and current pixel screen
      /// Just play around with it to achive desired effect
      setAnimationSpeed: function(speed) {
        mAnimationSpeed = 1/speed;
      },
      
      /// @function getSimulation
      /// Get World class that you can tweak
      /// @return {World} Returns World class that can be tweaked
      /// with desired parameters of velocity and acceleration      
      getSimulation: function() {
        return mInitialSimulation;
      },
      
      /// @function applyOn
      /// Apply drop effect on DOM element
      applyOn: function(element) {

        // clone element        
        var clone = mCloneBehaviour(element);        
              
                
        var initialDistance = clone.initialDistance;
        var simulation = mInitialSimulation.clone();
        var timeStep = parseInt(1000/mFramesPerSecond); // 1000 = 1 second

        // local state
        var currentOpacity = mFullyOpaque;
        var currentDistance = initialDistance; 

        var runEffect = function () {  
          
          simulation.update(timeStep);

          // move       
          currentDistance += parseInt(simulation.getDistance() * mAnimationSpeed);
//           currentDistance += Animation.linearInterpolation(parseInt(simulation.getDistance() * mAnimationSpeed),
//                                                            initialDistance, mFallDistance, 
//                                                            initialDistance, mFallDistance);          

          // fade away
          currentOpacity = Animation.linearInterpolation(currentDistance, initialDistance, mFallDistance,
                                                         mFullyOpaque, mFullyTransparent);        

          // cleanup when out of range and end recursion
          if (currentDistance > mFallDistance) {  
            mCleanupBehaviour(clone.element);                        
          }
          else {
            var simulationData = {
              distance: currentDistance, 
              opacity : currentOpacity
            };
            // apply to element
            mSimulationStepBehaviour(clone.element, simulationData);          

            // next step
            setTimeout(runEffect, timeStep);
          }    
        }; 
        
        runEffect(); // start the animation
      }
    };
  }  
};

/// @namespace fx
/// Module for predefined animations
var fx = {

  /// @function speedyDrop
  /// Simple drop animation with fade
  speedyDrop: function(element) {
    
    var bodyHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var elementPos = element.getBoundingClientRect().top;    
    var limit = bodyHeight - elementPos;
    
    var effect = Animation.DropEffect();
    effect.setAnimationFramesPerSecond(24);
    effect.setFallDistance(limit);    
    effect.setAnimationSpeed(50000);    
    effect.applyOn(element);
  },

  /// @function equalDrop
  /// Simple drop animation with constant speed
  equalDrop: function(element) {
    
    var bodyHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var elementPos = element.getBoundingClientRect().top;    
    var limit = bodyHeight - elementPos;    
    
    var effect = Animation.DropEffect();
    effect.getSimulation().setVelocity(20); 
    effect.getSimulation().setAcceleration(0);  
    effect.setFallDistance(limit);
    effect.setAnimationSpeed(1000);
    effect.applyOn(element);
  }
};

// Examples
// var result1 = document.getElementById("result");
// fx.speedyDrop(result1);

// var result2 = document.getElementById("result");
// fx.equalDrop(result2);