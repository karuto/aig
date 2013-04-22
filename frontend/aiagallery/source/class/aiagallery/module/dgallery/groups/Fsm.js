/**
 * Copyright (c) 2013 Derrell Lipman
 *                    Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
require(aiagallery.module.dgallery.appinfo.AppInfo)
 */

/**
 * Group page Finite State Machine
 */
qx.Class.define("aiagallery.module.dgallery.groups.Fsm",
{
  type   : "singleton",
  extend : aiagallery.main.AbstractModuleFsm,

  members :
  {
    buildFsm : function(module)
    {
      var fsm = module.fsm;
      var state;
      var trans;

      // ------------------------------------------------------------ //
      // State: Idle
      // ------------------------------------------------------------ //

      /*
       * State: Idle
       *
       * Actions upon entry
       *   - if returning from RPC, display the result
       */

      state = new qx.util.fsm.State("State_Idle",
      {
        "context" : this,

        "onentry" : function(fsm, event)
        {
          // Did we just return from an RPC request?
          if (fsm.getPreviousState() == "State_AwaitRpcResult")
          {
            // Yup.  Display the result.  We need to get the request object
            var rpcRequest = this.popRpcRequest();

            // Call the standard result handler
            var gui = aiagallery.module.dgallery.groups.Gui.getInstance();
            gui.handleResponse(module, rpcRequest);

            // Dispose of the request
            if (rpcRequest.request)
            {
              rpcRequest.request.dispose();
              rpcRequest.request = null;
            }
          }
        },

        "events" :
        {         
          // When we get an appear event, retrieve the category tags list. We
          // only want to do it the first time, though, so we use a predicate
          // to determine if it's necessary.
          "appear"    :
          {
            "main.canvas" : 
              "Transition_Idle_to_AwaitRpcResult_via_appear"
          },

          // When we get a disappear event
          "disappear" :
          {
            //"main.canvas" : "Transition_Idle_to_Idle_via_disappear"
          },

          // Button clicks
          "execute":
          {
            "searchBtn" : "Transition_Idle_to_AwaitRpcResult_via_groupSearch",

            "browseBtn" : "Transition_Idle_to_AwaitRpcResult_via_browseSearch"
          }
        }
      });

      // Replace the initial Idle state with this one
      fsm.replaceState(state, true);

      // BROWSE RPCS
      /*
       * Transition: Idle to Idle
       *
       * Cause: "appear" on canvas
       *
       * Action:
       *  If this is the very first appear, retrieve the the studio 
       *   ribbon data 
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_appear",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "predicate" : function(fsm, event)
        {
          // Have we already been here before?
          if (fsm.getUserData("noUpdate"))
          {
            // Yup. Don't accept this transition and no need to check further.
            return null;
          }
          
          // Prevent this transition from being taken next time.
          fsm.setUserData("noUpdate", true);
          
          // Accept this transition
          return true;
        },

        "ontransition" : function(fsm, event)
        {
         // Retrive user information

         var request =
             this.callRpc(fsm,
                          "aiagallery.features",
                          "getGroupRibbon",
                          []);
                         
          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "appear");
        }
      });

      state.addTransition(trans);


      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: User excuted a search for a group
       *
       * Action:
       *  Get and return groups of this name
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_groupSearch",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "predicate" : function(fsm, event)
        {
          if(fsm.getObject("searchTextField").getValue() == null ||
             fsm.getObject("searchTextField").getValue().trim().length == 0)
          { 
            // Ignore, search is empty
            return null;
          }
          else 
          {
            // Accept 
            return true; 
          }
        },

        "ontransition" : function(fsm, event)
        {
          var             request;
          var             query;

          // Get values from gui
          query = fsm.getObject("searchTextField")
                   .getValue().trim(); 

          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "groupSearch",
                         [ query ]
                         );

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "groupSearch");

        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: User excuted a search for a particular group type
       *
       * Action:
       *  Get and return groups of this name
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_browseSearch",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             request;
          var             type;
          var             subType;

          // Get values from gui
          type = fsm.getObject("typeSelect").getSelection()[0]
                   .getLabel().toString();
                  
          if (type != "General")
          {
            subType = fsm.getObject("subTypeSelect").getSelection()[0]
                        .getLabel().toString(); 
          }

          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "browseSearch",
                         [ type, subType ]
                         );

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "browseSearch");

        }
      });

      state.addTransition(trans);
      
      /*
       * Transition: Idle to Idle
       *
       * Cause: "disappear" on canvas
       *
       * Action:
       *  Stop our timer
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_Idle_via_disappear",
      {
        "nextState" : "State_Idle",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Disable enter key firing search on exit
          var searchButton = fsm.getObject("searchBtn");
          searchButton.getCommand().setEnabled(false);
        }
      });

      state.addTransition(trans);

      
      // ------------------------------------------------------------ //
      // State: <some other state>
      // ------------------------------------------------------------ //

      // put state and transitions here




      // ------------------------------------------------------------ //
      // State: AwaitRpcResult
      // ------------------------------------------------------------ //

      // Add the AwaitRpcResult state and all of its transitions
      this.addAwaitRpcResultState(module);


      // ------------------------------------------------------------ //
      // Epilog
      // ------------------------------------------------------------ //

      // Listen for our generic remote procedure call event
      fsm.addListener("callRpc", fsm.eventListener, fsm);
    }
  }
});
