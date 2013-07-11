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
      var             label;
      
      
      // Put whole page in a scroller 
      outerCanvas.setLayout(new qx.ui.layout.VBox());
      var scrollContainer = new qx.ui.container.Scroll();
      outerCanvas.add(scrollContainer, { flex : 1 });

      // Create a layout for this page
      // container width < layout min width
      box = new qx.ui.layout.HBox();
      box.setSpacing(5);
      canvas = new qx.ui.container.Composite(box).set({
        minWidth : 600
      });

      // Setup two horizontal panels for group list and detail
      groupsColumn = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
      detailColumn = new qx.ui.container.Composite(new qx.ui.layout.VBox(0)); 

/*
      canvas.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", minWidth: 120}), { flex : 1 });
      canvas.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", minWidth: 120}), { flex : 2 });
      canvas.add(new qx.ui.core.Widget().set({decorator: "main", backgroundColor: "green", minWidth: 120}), { flex : 3 });
*/

      // Text label
      label = new qx.ui.basic.Label("");
      label.set(
        {
          value : "<a href= http://gallery.appinventor.mit.edu/#page%3DApp%26uid%3D123034%26label%3DPong%20Cubed > Pong Cubed </a>",
          rich  : true
        });

      // Add everything up properly
      groupsColumn.add(label);    
      canvas.add(groupsColumn);  
      canvas.add(detailColumn);
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
