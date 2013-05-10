/**
 * Copyright (c) 2012 Derrell Lipman
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
 * User's own info page Finite State Machine
 */
qx.Class.define("aiagallery.module.dgallery.user.Fsm",
{
  type : "singleton",
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
            var gui = aiagallery.module.dgallery.user.Gui.getInstance();
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
          // On the clicking of a button, execute is fired
          "execute" :
          {
            // Profile Management buttons
            "saveBtn" : "Transition_Idle_to_AwaitRpcResult_via_saveBtn",
            
            // Studio Management buttons
            // Management Buttons
            "saveStudioBtn" : "Transition_Idle_to_AwaitRpcResult_via_save", 

            "deleteBtn" : "Transition_Idle_to_AwaitRpcResult_via_delete",

            "approveAllGroupUser" :
              "Transition_Idle_to_AwaitRpcResult_via_approveAllGroupUser",

            "approveGroupUser" :
              "Transition_Idle_to_AwaitRpcResult_via_approveGroupUser",   

            "removeGroupUsersMember" :
              "Transition_Idle_to_AwaitRpcResult_via_removeGroupUsersMember", 

            "removeGroupUsersWaitList" :
              "Transition_Idle_to_AwaitRpcResult_via_removeGroupUsersWaitList", 

            "removeGroupUsersInvite" :
              "Transition_Idle_to_AwaitRpcResult_via_removeGroupUsersInvite", 

            "requestBtn" :
              "Transition_Idle_to_AwaitRpcResult_via_requestUsers"

          },
         
          // Event when the studio management page first appears,
          // much like an appear event on the old group page 
          "initialStudioLoad" :
            "Transition_Idle_to_AwaitRpcResult_via_initialStudioLoad",

          "changeSelection":
          {
            "groupNameList"
              : "Transition_Idle_to_AwaitRpcResult_via_getGroup",

            "userJoinRadioButtonGroup"
              : "Transition_Idle_to_AwaitRpcResult_via_save"
          },

          // When we get an appear event, retrieve the category tags list. We
          // only want to do it the first time, though, so we use a predicate
          // to determine if it's necessary.
          "appear"    :
          {
            "main.canvas" : 
              //qx.util.fsm.FiniteStateMachine.EventHandling.PREDICATE
              "Transition_Idle_to_AwaitRpcResult_via_appear"
          },

          // When we get a disappear event
          "disappear" :
          {
            "main.canvas" : //"Transition_Idle_to_checkLeave"
              "Transition_Idle_to_Idle_via_disappear"
          }
        }
      });

      // Replace the initial Idle state with this one
      fsm.replaceState(state, true);

      // PROFILE MANAGEMENT STATES

      // The following transitions have a predicate, so must be listed first

      /*
       * Transition: Idle to Idle
       *
       * Cause: "appear" on canvas
       *
       * Action:
       *  If this is the very first appear, retrieve the category list.
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
                          "getUserProfile",
                          []);
                         
          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "appear");
        }
      });

      state.addTransition(trans);


      /*
       * Transition: Idle to Awaiting RPC Result
       *
       * Cause: "save" button pressed
       *
       * Action:
       *  Save the new user profile chances
       */
        
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_saveBtn",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             newUserInfo = {};
          var             request;
          var             field; 
          var             fieldYear;
          var             fieldMonth;
          var             yearString;
          var             monthString; 
          var             profileImageString;
          
          // Parse data from dialog into map
          // Ensure no added whitespace by using trim()
          // Ensure no nulls are added as well
          field = fsm.getObject("userNameField");
          newUserInfo["displayName"] = field.getValue().trim(); 

          // If one of these fields is not set
          // then ignore both
          fieldYear = fsm.getObject("dobYearSBox");  
          fieldMonth = fsm.getObject("dobMonthSBox");          

          yearString = fieldYear.getSelection()[0].getLabel(); 
          monthString = fieldMonth.getSelection()[0].getLabel(); 
          if (monthString != "Month" && yearString != "Year")
          {     
            newUserInfo["birthYear"] = parseInt(yearString); 
            newUserInfo["birthMonth"] = monthString;
          } 
          else 
          {
            newUserInfo["birthYear"] = 0; 
            newUserInfo["birthMonth"] = "";
          }

          field = fsm.getObject("emailField");
          newUserInfo["email"] = field.getValue().trim(); 

          field = fsm.getObject("locationField");
          if (field.getValue() != null)
          {
            newUserInfo["location"] = field.getValue().trim(); 
          }

          field = fsm.getObject("orgField");
          if (field.getValue() != null)
          {
            newUserInfo["organization"] = field.getValue().trim(); 
          }

          field = fsm.getObject("urlField");
          if (field.getValue() != null)
          {
            newUserInfo["url"] = field.getValue().trim(); 
          }

          field = fsm.getObject("bioTextArea");
          if (field.getValue() != null)
          {
            newUserInfo["bio"] = field.getValue(); 
          }

          // DB Does not support booleans
          // 0 for false, 1 for true
          field = fsm.getObject("showEmailCheck");
          if (field.getValue())
          {
            newUserInfo["showEmail"] = 1;
          } 
          else
          {
            newUserInfo["showEmail"] = 0;
          }

          field = fsm.getObject("likedAppCheck");
          newUserInfo["updateOnAppLike"] = field.getValue() ? 1 : 0; 

          field = fsm.getObject("likedAppUpdateFrequency");
          if(field.getSelection()[0].getLabel() != "Every...")
          {
            var numStr = field.getSelection()[0].getLabel(); 
            newUserInfo["updateOnAppLikeFrequency"] = parseInt(numStr);
          }
          else if(newUserInfo["updateOnAppLike"] == 1)
          {
            // The default value if the user does not set it is 1
            newUserInfo["updateOnAppLikeFrequency"] = 1;
          }

          field = fsm.getObject("commentAppCheck");
          newUserInfo["updateOnAppComment"] = field.getValue() ? 1 : 0; 
                    
                    
          profileImageString = fsm.getObject("profileImageCheck").getValue();
          console.log(profileImageString);
                              
          // Ensure we have a data url captured from profile image upload form
          if (! qx.lang.Type.isString(profileImageString) ||
                profileImageString.substring(0, 5) != "data:") 
          {
            // The image is invalid. Let 'em know.
            // TODO: ReferenceError: error is not defined
            /*
            error.setCode(4);
            error.setMessage("Invalid image data");
            throw error;
            */
          } else {
            // The image is valid. Prepare to send it to backend for processing
            console.log(profileImageString.substring(0, 5));
            newUserInfo["image1"] = profileImageString;
          }
          
          
          field = fsm.getObject("commentAppUpdateFrequency");
          if(field.getSelection()[0].getLabel() != "Every...")
          {
            var numStr = field.getSelection()[0].getLabel(); 
            newUserInfo["updateCommentFrequency"] = 
              parseInt(numStr);
          }
          else if(newUserInfo["updateOnAppComment"] == 1)
          {
            // The default value if the user does not set it is 1
            newUserInfo["updateCommentFrequency"] = 1;
          }

          field = fsm.getObject("downloadAppCheck");
          newUserInfo["updateOnAppDownload"] = field.getValue() ? 1 : 0; 

          field = fsm.getObject("downloadAppUpdateFrequency");
          if(field.getSelection()[0].getLabel() != "Every...")
          {
            var numStr = field.getSelection()[0].getLabel(); 
            newUserInfo["updateOnAppDownloadFrequency"] = 
              parseInt(numStr);
          }
          else if(newUserInfo["updateOnAppDownload"] == 1)
          {
            // The default value if the user does not set it is 1
            newUserInfo["updateOnAppDownloadFrequency"] = 1;
          }
          
          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "editProfile",
                         [
                          newUserInfo 
                         ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "editUserProfile");

        }
      });

      state.addTransition(trans);


      /*
       * Transition: Idle to checkLeave
       *
       * Cause: "disappear" on canvas
       *
       * Action: Check if the user wants to leave this page
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_checkLeave",
      {
        "nextState" : "Transition_Idle_to_Idle_via_disappear",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // If the user leaves the page with unsaved changes 
          // pop a warning message
          var val = 
            dialog.Dialog.confirm("You have unsaved changes. Leave Page?",
            function(result)
              {
                //dialog.Dialog.alert("Your answer was: " + result );
                return result; 
              }
            ); 

          // If user hit yes, return true, else null to not 
          // take transition
          return val ? true : null; 
        }
      });

      state.addTransition(trans);

      // STUDIO MANAGEMENT STATES
      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: User switched to studio management page.
       *  
       * Action:
       *  If this is the very first appear, retrieve 
       *  all the groups a user owns. 
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_initialStudioLoad",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var    request;

          // Get all the groups a user owns if any
          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getUserGroups",
                         []);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "initialStudioLoad");
        }
      });

      state.addTransition(trans);
        
      /*
       * Transition: Idle to  Awaiting RPC Result
       *
       * Cause: Save button clicked
       *
       * Action:
       *  Save the group 
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_save",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "predicate" : function(fsm, event)
        {
          var      name;
          var      warnString;
 
          // User must specify group name
          name = fsm.getObject("groupNameField").getValue().trim();
          if (name == null || name == "")
          {
            // FIXME get this.tr working for this string
            warnString = "You must specify a group name.";

            dialog.Dialog.warning(warnString);

            return null; 
          }
          
          
          // Accept this transition
          return true;
        },

        "ontransition" : function(fsm, event)
        {
          var             request;
          var             name;
          var             description;
          var             groupType; 
          var             subGroupType;
          var             joinType; 

          // Get values from gui
          name = fsm.getObject("groupNameField").getValue();

          // User is updating existing group
          if (name == "" || !name)
          {
            name = fsm.getObject("groupNameList").getSelection()[0].getLabel();
          }

          description = fsm.getObject("groupDescriptionField").getValue();
 
          // Group Type
          groupType = fsm.getObject("groupTypeBox")
                        .getSelection()[0].getLabel().toString();

          if (groupType == aiagallery.dbif.Constants.GroupTypes.Educational)
          {
            // Set the subgroup type
            subGroupType = fsm.getObject("eduTypeRadioButtonGroup")
                             .getSelection()[0].getLabel().toString(); 
          } 
          else 
          {
            subGroupType = null; 
          }

          // How users will be allowed to join
          joinType = fsm.getObject("userJoinRadioButtonGroup")
                       .getSelection()[0].getUserData("enum"); 


          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "addOrEditGroup",
                         [ name, description, 
                           groupType, subGroupType, joinType]
                         );

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "addOrEditGroup");

        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: User is deleting a group
       *
       * Action:
       *  Delete the currently selected group
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_delete",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             request;
          var             name;

          // Get values from gui
          name = fsm.getObject("groupNameList")
                   .getSelection()[0].getLabel();
 
          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "deleteGroup",
                         [ name ]
                         );

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "deleteGroup");

        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: User clicked approve all button
       *
       * Action:
       *  Approve all users currently on the waitlist
       *    for a group 
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_approveAllGroupUser",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             request;
          var             name;

          // Get values from gui
          name = fsm.getObject("groupNameList")
                   .getSelection()[0].getLabel();
 
          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "approveAllUsers",
                         [ name ]
                         );

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "approveAllGroupUser");

        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: User clicked approve user button
       *
       * Action:
       *  Approve the selected waitlist members
       *    for a group 
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_approveGroupUser",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             request;
          var             name;
          var             selection;
          var             usersToApprove = [];

          // Get values from gui
          name = fsm.getObject("groupNameList")
                   .getSelection()[0].getLabel();
 
          selection = fsm.getObject("groupWaitList").getSelection();

          selection.forEach(
            function(sel)
            {
              usersToApprove.push(sel.getLabel()); 
            }
          );

          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "approveUsers",
                         [ name, usersToApprove ]
                         );

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "approveGroupUser");

        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: User clicked approve user remove button for 
       *        a member
       *
       * Action:
       *  Remove a user from the group
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_removeGroupUsersMember",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             request;
          var             name;
          var             selection;
          var             usersToRemoveMap;

          usersToRemoveMap = 
            {
              users     : [],
              waitList  : [],
              requested : []        
            };

          // Get values from gui
          name = fsm.getObject("groupNameList")
                   .getSelection()[0].getLabel();
 
          selection = fsm.getObject("groupUsers").getSelection();

          selection.forEach(
            function(sel)
            {
              usersToRemoveMap.users.push(sel.getLabel()); 
            }
          );
        
          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "removeGroupUsers",
                         [ name, usersToRemoveMap ]
                         );

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "removeGroupUsers");

        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: User clicked approve user remove button for a
       *        wait list user
       *
       * Action:
       *  Remove a user from the group
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_removeGroupUsersWaitList",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             request;
          var             name;
          var             selection;
          var             usersToRemoveMap;

          usersToRemoveMap = 
            {
              users     : [],
              waitList  : [],
              requested : []        
            };

          // Get values from gui
          name = fsm.getObject("groupNameList")
                   .getSelection()[0].getLabel();

          selection = fsm.getObject("groupWaitList").getSelection();

          selection.forEach(
            function(sel)
            {
              usersToRemoveMap.waitList.push(sel.getLabel()); 
            }
          );

          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "removeGroupUsers",
                         [ name, usersToRemoveMap ]
                         );

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "removeGroupUsers");

        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: User clicked approve user remove button for
       *        an invited user
       *
       * Action:
       *  Remove a user from the group
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_removeGroupUsersInvite",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             request;
          var             name;
          var             selection;
          var             usersToRemoveMap;

          usersToRemoveMap = 
            {
              users     : [],
              waitList  : [],
              requested : []        
            };

          // Get values from gui
          name = fsm.getObject("groupNameList")
                   .getSelection()[0].getLabel();

          selection = fsm.getObject("groupRequestList").getSelection();

          selection.forEach(
            function(sel)
            {
              usersToRemoveMap.requested.push(sel.getLabel()); 
            }
          );

          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "removeGroupUsers",
                         [ name, usersToRemoveMap ]
                         );

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "removeGroupUsers");

        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: User selected another group they own on the 
       *   group name list. 
       *
       * Action:
       *  Get a map of information about the selected group
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_getGroup",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "predicate" : function(fsm, event)
        {
          if(fsm.getObject("groupNameList")
                   .getSelection().length != 0)
          { 
            // Accept
            return true;
          }
          else 
          {
            // Ignore request
            return null; 
          }
        },

        "ontransition" : function(fsm, event)
        {
          var             request;
          var             name;

          // Get values from gui
          // Only get a name if we can, if not ignore request
          name = fsm.getObject("groupNameList")
                   .getSelection()[0].getLabel();

          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getGroup",
                         [ name, false ]
                         );

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "getGroup");

        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: User hit request users button
       *
       * Action:
       *  Parse the names/emails of requested users 
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_requestUsers",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "predicate" : function(fsm, event)
        {
          var requestedUsers;
          var name;
          var warnString; 

          requestedUsers = fsm.getObject("groupUsersField").getValue().trim(); 

          if(requestedUsers == null || requestedUsers == "")
          { 
            // Bad request no users to work with
            warnString = "You must enter in either some user names or user"
                         + "gmail emails."; 

            dialog.Dialog.warning(warnString); 

            return null; 
          }

          name = fsm.getObject("groupNameList")
                   .getSelection()[0].getLabel();

          if(name == null || name == "")
          { 
            // Bad request no users to work with
            warnString = "You must make a group first before"
                         + " requesting users for it";

            dialog.Dialog.warning(warnString); 

            return null; 
          }          

          // Accept this transition
          return true; 
        },

        "ontransition" : function(fsm, event)
        {
          var             request;
          var             name;
          var             requestedUsers;

          // Get values from gui
          name = fsm.getObject("groupNameList")
                   .getSelection()[0].getLabel();

          // Get requested users
          requestedUsers = fsm.getObject("groupUsersField").getValue();

          if(requestedUsers && requestedUsers.length != 0)
          {
            requestedUsers = requestedUsers.split(",");
          }
          else 
          {
            requestedUsers = null; 
          }
 
          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "requestUsers",
                         [ name, requestedUsers ]
                         );

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "requestUsers");

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
