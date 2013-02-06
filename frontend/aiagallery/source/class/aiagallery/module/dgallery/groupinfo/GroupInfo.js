/**
 * Copyright (c) 2013 Derrell Lipman
 *                    Paul Geromini 
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * Group Info module
 */
qx.Class.define("aiagallery.module.dgallery.groupinfo.GroupInfo",
{
  type   : "singleton",
  extend : aiagallery.main.AbstractModule,

  statics :
  {
    /**
     * Add a new group view (module / tab)
     *
     * @param name {String}
     *   The name of the group to be displayed
     *
     * @param label {String}
     *   The label to present in the tab for this group
     */
    addGroupView : function(name, label)
    {
      var             group;
      var             page;
      var             moduleList;
      
      // Get the main tab view
      var mainTabs = qx.core.Init.getApplication().getUserData("mainTabs");

      // Create a new ephemeral ("-") module for this application
      group = new aiagallery.main.Module(
              "-" + label,
              null,
              "-" + label,
              aiagallery.main.Constant.PageName.GroupInfo,
              aiagallery.module.dgallery.groupinfo.GroupInfo,
              [
                function(menuItem, page, subTabs)
                {
                  // Select the new application page
                  mainTabs.setSelection([ page ]);
               }
              ]);

      // Transmit the UID of this module */
      group.setUserData("groupName", name);

      // Make this module ephemeral
      label = "-" + label;

      // Start up the new module
      moduleList = {};
      moduleList[label] = {};
      moduleList[label][label] = group;
      aiagallery.Application.addModules(moduleList);
    }
  },


  members :
  {
    /**
     * Create the module's finite state machine and graphical user interface.
     *
     * This function is called the first time a module is actually selected to
     * appear.  Creation of the module's actual FSM and GUI have been deferred
     * until they were actually needed (now) so we need to create them.
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     */
    initialAppear : function(module)
    {
      // Replace existing (temporary) finite state machine with the real one.
      aiagallery.module.dgallery.groupinfo.Fsm.getInstance().buildFsm(module);

      // Create the real gui.
      aiagallery.module.dgallery.groupinfo.Gui.getInstance().buildGui(module);
    }
  }
});
