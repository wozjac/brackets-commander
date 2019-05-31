module.exports = function (grunt) {
    require("load-grunt-tasks")(grunt);

    const options = {
        distDir: "dist"
    };

    grunt.initConfig({
        pkg: "<json:package.json>",

        clean: {
            dist: ["dist", "node/node_modules", "precompiled"]
        },

        "curl-dir": {
            "node-pty": {
                src: [
					"http://public_repo.vipserv.org/node-pty-linux.zip",
					"http://public_repo.vipserv.org/node-pty-win.zip",
                    "http://public_repo.vipserv.org/node-pty-osx.zip",
				],
                dest: "precompiled"
            }
        },

        copy: {
            dist: {
                files: [{
                    expand: true,
                    src: ["node_modules/nan/**", "node_modules/xterm/**"],
                    dest: "node"
                }]
            }
        },

        zip: {
            dist: {
                src: ["assets/**", "js/**", "nls/**", "node/**", "view/**", "main.js", "strings.js", "package.json"],
                dest: `${options.distDir}/wozjac.commander.zip`
            }
        },

        unzip: {
            "node-pty": {
                src: ["precompiled/node-pty-linux.zip", "precompiled/node-pty-win.zip", "precompiled/node-pty-osx.zip"],
                dest: "node/node_modules/"
            }
        }
    });

    grunt.registerTask("dist", ["clean", "curl-dir", "unzip", "copy", "zip"]);
    grunt.registerTask("default", ["dist"]);
};
