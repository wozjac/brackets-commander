module.exports = function (grunt) {
    require("load-grunt-tasks")(grunt);

    const options = {
        distDir: "dist"
    };

    grunt.initConfig({
        pkg: "<json:package.json>",
        clean: {
            dist: ["dist", "node/node_modules"]
        },

        copy: {
            dist: {
                expand: true,
                src: ["node_modules/nan/**", "node_modules/node-pty/**", "node_modules/xterm/**"],
                dest: "node"
            }
        },

        zip: {
            dist: {
                src: ["assets/**", "js/**", "nls/**", "node/**", "view/**", "main.js", "strings.js", "package.json"],
                dest: `${options.distDir}/wozjac.commander.zip`
            }
        }
    });

    grunt.registerTask("dist", ["clean:dist", "copy:dist", "zip"]);
    grunt.registerTask("default", ["dist"]);
};
