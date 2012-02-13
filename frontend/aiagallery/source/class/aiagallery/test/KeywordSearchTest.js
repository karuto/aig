/**
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.KeywordSearchTest",
{
  extend : qx.dev.unit.TestCase,
  
  members :
  {
    "test 01: Keyword Search" : function()
    {
      var queryResults;
      
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      // We need an error object
      var error = new liberated.rpc.error.Error("2.0");
      
      // This is used for the malformed string tests below
      var badSearchData = "Th.z st!@#$%wef^&*we(()  #$% MY!!!!! cala#ity is suppo$ed to be malformed";

      dbifSim.setWhoAmI(
        {
          id : "1002",
          email : "billy@thekid.edu",
          isAdmin: false,
          logoutUrl: "undefined",
          permissions: [],
          displayName :  "Billy The Kid"
        });

      // Ensure the database is properly initialized
      liberated.sim.Dbif.setDb(
        qx.lang.Object.clone(aiagallery.dbif.MSimData.Db, true));

      // Handcrafting a bunch of Apps with various words in their text fields
      var myApps = 
        [
          {
            owner       : "1002",
            description : "This one's beautiful",
            title       : "The Shooting Game",
            tags        : ["shooter", "shooting", "game", "Games"],
            source      : "somerandomstring",
            image1      : "data://xxx"
          },
          
          {
            source      : "somerandomstring",
            owner       : "1002",
            description : "This one's sexy and beautiful",
            title       : "Your Mother Jokes",
            tags        : ["funny", "Business"],
            image1      : "data://xxx"
          },

          {
            source      : "somerandomstring",
            owner       : "1002",
            description : "This one's sexy",
            title       : "Laughapalooza",
            tags        : ["Business"],
            image1      : "data://xxx"
          },
            
          {
            source      : "somerandomstring",
            owner       : "1002",
            description : "This one's not interesting in any way",
            title       : "Microsoft Windows for Android",
            tags        : ["Business", "broken"],
            image1      : "data://xxx"
          },

	  {
            source      : "somerandomstring",
            owner       : "1002",
            description : badSearchData,
            title       : "--DROP TABLEz LOLZ",
            tags        : ["Games", "broken"],
            image1      : "data://xxx"
          }
        ];

      myApps.forEach(
        function(obj)
        {
          var ret = dbifSim.addOrEditApp(null, obj, error);
          this.assertNotEquals(error, ret,
                               "addOrEditApp failed: " + error.stringify());
        },
        this);

      // Test with one word present in title of 1 app
      queryResults = dbifSim.keywordSearch("mother", null, null, error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());

      this.assertEquals(1, queryResults.length,
                        "Expected 1 result; got " + queryResults.length);

      // Save the UID for later
      var uidToEdit = queryResults[0].uid;

      // Test with one word present in 2 apps
      queryResults = dbifSim.keywordSearch("beautiful", null, null, error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());

      this.assertEquals(2, queryResults.length,
                        "Expected 2 results; got " + queryResults.length);

      // Test with 2 words present in 1 app, each present in 4 total
      queryResults = dbifSim.keywordSearch("this not", null, null, error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());
      
      this.assertEquals(0, queryResults.length,
                        "Both stop words so expect 0 results; got" +
                        queryResults.length);

      // Test with 2 words present in 1 app, each present in 3 total
      queryResults = dbifSim.keywordSearch("beautiful sexy", null, null, error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());
      
      this.assertEquals(3, queryResults.length,
                        "Expected 3 results; got " + queryResults.length);
    
      var firstResultDescription = queryResults[0]["description"];
      var descSplit = firstResultDescription.split(" ");
      
      // First result should contain both keywords
      this.assert(qx.lang.Array.contains(descSplit, "beautiful") &&
                  qx.lang.Array.contains(descSplit, "sexy"),
                  "Results ordered correctly for 2 keyword search");
      
      //Test with 1 word not present in any app
      queryResults = dbifSim.keywordSearch("meowmeowmeowcatshisss",
                                           null,
                                           null,
                                           error);

      // ensure that an error was not returned
      this.assert(queryResults !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());
      
      this.assertEquals(0, queryResults.length,
                        "Expected 0 results; got " + queryResults.length);

      // Updating an App to see that old information is disposed
      var appUpdate = {
        source      : "somerandomstring",
        owner       : "1002",
	description : "This one's sexy and beautiful",
	title       : "Your Father Jokes",
	tags        : ["funny", "Business"],
	image1      : "data://xxx"
      }
      
      // Make sure the thing updates fine, first
      var editingApp = dbifSim.addOrEditApp(uidToEdit, appUpdate, error);      
      this.assertNotEquals(error, editingApp,
			   "Editing App failed: " + error.stringify());

      // Test with one word which is no longer present
      queryResults = dbifSim.keywordSearch("mother", null, null, error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());

      this.assertEquals(0, queryResults.length,
                        "Expected 0 results; got " + queryResults.length);
      
      // Looking for bad search data
      var badDataArr = badSearchData.split(" ");
      queryResults = [];

      for (str in badDataArr) 
      {
	  queryResults = queryResults.concat(dbifSim.keywordSearch(str,
								   null,
								   null,
								   error));
      }

      for (obj in queryResults)
      {
	  this.assert(obj !== error,
		      "Error: " + error.getCode() + ": " + error.getMessage());
	  
	  this.assertMatch(obj, /[a-z0-9]{2,}/gi, "Bad search data getting " +
			   "through!!");
      }
    }
  }
});  

