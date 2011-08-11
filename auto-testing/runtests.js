// Specify the recipient of the test results
var             recipient = "app-inventor-gallery-developers@googlegroups.com";
//var             recipient = "derrell.lipman@gmail.com";

// Prepare to build all of the output
var             output = "";
var             opt;
var             cmd;

// We're not currently debugging
var             debug = false;

//
// Pull the main repository
//
opt = 
  {
    err    : "Error output:\n",
    output : ""
  };

cmd = "% git pull origin wip\n";
runCommand("git", "pull", "origin", "wip", opt);

if (debug)
{
  output += cmd + opt.output;
  output += opt.err + "\n";
}
else
{
  output += cmd + "<output elided>";
}

output +=
  "\n" +
  "------------------------------------------------------------" +
  "\n" +
  "\n";


//
// Build the tester
//
opt = 
  {
    err    : "Error output:\n",
    output : ""
  };
cmd =
  "% ./generate.py test-source " +
  "-m TESTRUNNER_VIEW:testrunner.view.Console" +
  "\n";
runCommand("/usr/bin/python",
           "./generate.py",
           "test-source",
           "-m",
           "TESTRUNNER_VIEW:testrunner.view.Console",
           opt);

if (debug)
{
  output += cmd + opt.output;
  output += opt.err + "\n";
}
else
{
  output += cmd + "<output elided>";
}

output +=
  "\n" +
  "------------------------------------------------------------" +
  "\n" +
  "\n";

//
// Run the tests!
//
opt = 
  {
//    err : "Error output:\n",
    output : "Running tests...\n\n"
  };
runCommand("/home/derrell/ME/phantomjs.git/bin/phantomjs",
           "/home/derrell/ME/phantomjs.git/headless/testrunner.js",
           "aiagallery.test",
           "test/index-source.html",
           opt);

// Append its output to previous output
output += opt.output;
//output += opt.err;

runCommand("mail",
           "-s",
           "App Inventor Gallery automated tests",
           recipient,
           {
             input : output
           });
