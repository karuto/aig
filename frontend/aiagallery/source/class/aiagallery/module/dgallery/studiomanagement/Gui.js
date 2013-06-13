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
