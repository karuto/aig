/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2013 Vincent Yao Zhang
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the Studio Management page
 */

qx.Class.define("aiagallery.module.dgallery.studiomanagement.Gui",
{
  type : "singleton",
  extend : qx.ui.core.Widget,
  
  events :
  {
    serverPush : "qx.event.type.Data"
  },

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
      var             outerCanvas = module.canvas;
      
      var             box;
      var             canvas; 
      var             topCanvas;
      var             columnCanvas;       
      var             label;
      var             button;
      
      
      // Put whole page in a scroller 
      outerCanvas.setLayout(new qx.ui.layout.VBox());
      var scrollContainer = new qx.ui.container.Scroll();
      outerCanvas.add(scrollContainer, { flex : 1 });
      // Create the major container that will be adding things into
      canvas = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      // Page top container
      topCanvas = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      
      // Page top text label
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<div style='font-size:18px; font-weight:900;'>Studios Management</div>",
          rich  : true
        });
      topCanvas.add(label);
      
      // Page top buttons
      button = new qx.ui.form.ToggleButton("My studios");
      topCanvas.add(button);
      button = new qx.ui.form.ToggleButton("Create new studio");
      button.focus();
      topCanvas.add(button);
      
      canvas.add(topCanvas);


      // Android-green line divider
      o = new qx.ui.container.Composite();
      o.set(
        {
          height    : 4,
          backgroundColor : "#a5c43c"
        });
      canvas.add(o);

      // Create a container for the 2 main columns
      columnCanvas = new qx.ui.container.Composite(new qx.ui.layout.VBox(15));
      
      
      box = new qx.ui.layout.VBox();
      box.setSpacing(5);
      // Setup two horizontal panels for group list and detail
      groupsColumn = new qx.ui.container.Composite(box).set({
        minWidth : 300
      });
      detailColumn = new qx.ui.container.Composite(box).set({
        minWidth : 600
      });
      
      // Text label
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<div style='font-size:18px;'>My studios $raquo;</div>",
          rich  : true,
          width : 300
        });

      // Add everything up properly
      groupsColumn.add(label);    
      
      // Text label
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<div style='font-size:21px;'>Test group name goes here</div>",
          rich  : true,
          width : 600
        });

      detailColumn.add(label);    
      
      // Add everything up properly
      columnCanvas.add(groupsColumn);  
      /*
      // Android-green line divider in between 2 columns
      o = new qx.ui.container.Composite();
      o.set(
        {
          width    : 2,
          backgroundColor : "#a5c43c"
        });
      columnCanvas.add(o);
      */
      columnCanvas.add(detailColumn);
      canvas.add(columnCanvas);
      scrollContainer.add(canvas, { flex: 1 });     
      
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
    }

  }
});
