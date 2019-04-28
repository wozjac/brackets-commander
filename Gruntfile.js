module.exports = function (grunt) {
    require("load-grunt-tasks")(grunt);

    const options = {
        distDir: "dist"
    };

    grunt.initConfig({
        pkg: "<json:package.json>",
        clean: {
            dist: ["dist"]
        },

        zip: {
            dist: {
                src: ["css/**", "js/**", "nls/**", "node/**", "view/**", "main.js", "strings.js", "package.json"],
                dest: `${options.distDir}/wozjac.commander.zip`
            }
        },

        copy: {
            dist: {
                files: [{
                    expand: true,
                    src: ["css/**"],
                    dest: options.distDir
                }]
            }
        }
    });

    grunt.registerTask("dist", ["clean:dist", "zip"]);
    grunt.registerTask("default", ["dist"]);
};
