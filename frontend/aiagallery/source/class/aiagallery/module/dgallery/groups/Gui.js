/**
 * Copyright (c) 2013 Derrell Lipman
 *                    Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for group management and browsing
 */
qx.Class.define("aiagallery.module.dgallery.groups.Gui",
{
  type   : "singleton",
  extend : qx.ui.core.Widget,

  members :
  {
    /**
     * Build the raw graphical user interface.
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     */
    buildGui : function(module)
    {
      var             o;
      var             fsm = module.fsm;
      var             canvas = module.canvas;
      var             manageCanvas;
      var             browseCanvas;
      var             btnManage;
      var             btnBrowse;
      var             label; 

      // Layouts
      var             btnLayout; 

      // Two views to this module
      manageCanvas = new qx.ui.container.Composite(new qx.ui.layout.VBox);
      browseCanvas = new qx.ui.container.Composite(new qx.ui.layout.VBox);

      this.__radioView = 
        new aiagallery.widget.radioview.RadioView(this.tr("Groups: "));

      canvas.add(this.__radioView); 

      // Create the pages
      [
        {
          field  : "__containerBrowse",
          label  : this.tr("Browse and Join Groups"),
          custom : this._browseGroups
        },
        {
          field  : "__containerManage",
          label  : this.tr("Create and Manage Groups"),
          custom : this._manageGroups
        }
      ].forEach(
        function(pageInfo)
        {
          var             layout;

          // Create the page
          this[pageInfo.field] =
            new aiagallery.widget.radioview.Page(pageInfo.label);

          // Set its properties
          this[pageInfo.field].set(
          {
            layout       : new qx.ui.layout.VBox(),
            padding      : 20
          });
        
          // If there's a function for customizing this page, ...
          if (pageInfo.custom)
          {
            // ... then call it now. It's called in our own context, with the
            // page container as the parameter.
            qx.lang.Function.bind(pageInfo.custom, this)(this[pageInfo.field]);
          }
        
          // Add this page to the radio view
          this.__radioView.add(this[pageInfo.field]);
        },
        this);
    
      // When the radioview selection changes, copy fields or clear entry
      this.__radioView.addListener(
        "changeSelection",
        function(e)
        {       
          // Determine what page we are switching to and fire off the 
          // appropriate FSM event to get the data we need
  
        },
        this);
      
    },

    /**
     * Create the static content in the browseGroups page
     * 
     * @param container {qx.ui.core.Widget}
     *   The container in which the content should be placed. 
     */
    _browseGroups : function(container)
    {
      container.add(new qx.ui.basic.Label("YOBRO")); 
    },

    /**
     * Create the static content in the manageGrousp page
     * 
     * @param container {qx.ui.core.Widget}
     *   The container in which the content should be placed. 
     */
    _manageGroups : function(container)
    {
    },
    
    /**
     * Handle the response to a remote procedure call
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     *
     * @param rpcRequest {var}
     *   The request object used for issuing the remote procedure call. From
     *   this, we can retrieve the response and the request type.
     */
    handleResponse : function(module, rpcRequest)
    {
      var             fsm = module.fsm;
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             result;

      // We can ignore aborted requests.
      if (response.type == "aborted")
      {
          return;
      }

      if (response.type == "failed")
      {
        // FIXME: Add the failure to the cell editor window rather than alert
        alert("Async(" + response.id + ") exception: " + response.data);
        return;
      }

      // Successful RPC request.
      // Dispatch to the appropriate handler, depending on the request type
      switch(requestType)
      {
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
