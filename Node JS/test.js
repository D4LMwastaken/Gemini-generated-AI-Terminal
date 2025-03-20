 // test.js (Corrected - Default Import)
   const chalk = require('chalk').default; // Access the .default property

   console.log(chalk.green`Hello, world!`);
   console.log(chalk.blue.bold`This should be bold blue.`);