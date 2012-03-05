/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the gallery "find apps"" page
 */
qx.Class.define("aiagallery.module.dgallery.findapps.Gui",
{
  type : "singleton",
  extend : qx.ui.core.Widget,

  events :
  {
    queryChanged : "qx.event.type.Data"
  },

  properties :
  {
    query :
    {
      init     : null,
      nullable : true,
      apply    : "_applyQuery"
    }
  },

  members :
  {
    /** Whether FSM events should be temporarily prevented */
    __bPreventFsmEvent : false,

    /**
     * Build the raw graphical user interface.
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     */
    buildGui : function(module)
    {
      var             o;
      var             canvas = module.canvas;
      var             fsm = module.fsm;
      var             criteriaTop = 10;

      // Make it easy to provide some space around the edges
      canvas.setLayout(new qx.ui.layout.Canvas());

      if (false)
      {
        var hbox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
        criteriaTop = 60;
        canvas.add(hbox, { top : 10, left : 10 });
        var json = new qx.ui.form.TextField();
        json.setWidth(200);
        hbox.add(json);
        var but = new qx.ui.form.Button("Set Query");
        hbox.add(but);
        but.addListener(
          "execute",
          function(e)
          {
            this.__criteria.setQuery(json.getValue());
          },
          this);
      }

      // Add the whole search criteria (and its search results)
      this.__criteria =
        new aiagallery.module.dgallery.findapps.CriteriaSearch();
      
      // Add a listener for a new search
      this.__criteria.addListener("queryChanged", fsm.eventListener, fsm);
      
      // Also fire our own event so that the history can be updated
      this.__criteria.addListener(
        "queryChanged",
        function(e)
        {
          var             messageBus;

          // Dispatch a message for any subscribers to
          // this type.
          messageBus = qx.event.message.Bus.getInstance();
          messageBus.dispatchByName("findapps.query", e.getData());
        },
        this);

      // Add a listener for when the user clicks on an app in search results
      this.__criteria.addListener("viewApp", fsm.eventListener, fsm);
    
      canvas.add(this.__criteria, 
                 { top : criteriaTop, left : 10, bottom : 10, right : 10 });
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
      var             apps;
      var             categories;
      var             model;

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
      case "getCategoryTags":
        this.__criteria.setCategoryList(response.data.result);
        break;
      
      case "intersectKeywordAndQuery":
        // Retrieve the app list
        apps = response.data.result;
        
        // Build a model for the search results list
        model = qx.data.marshal.Json.createModel(apps);

        // Add the data to the list
        this.__criteria.getSearchResultsList().setModel(model);
        break;
        
        
      case "appQuery":
        // Retrieve the app list and list of categories
        apps = response.data.result.apps;

        // unused...
        //categories = response.data.result.categories;
        
        // Build a model for the search results list
        model = qx.data.marshal.Json.createModel(apps);

        // Add the data to the list
        this.__criteria.getSearchResultsList().setModel(model);
        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    },
    
    _applyQuery : function(value, old)
    {
      // If the value is being set back to null because a query was just
      // applied, there's nothing we need to do.
      if (value === null)
      {
        return;
      }
      
      // Issue the specified query
      this.__criteria.setQuery(value);
      
      // Set the value back to null so we're ready for next time
      this.setQuery(null);
    }
  }
});
