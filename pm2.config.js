module.exports = {
    apps: [{
        name: "callbot",
        script: "./engine_test.js",
        instances: 1,
        out_file: "./logs/pm2.out.log",
        error_file: "./logs/pm2.err.log",
        node_args: ["--max_old_space_size=256"],
        max_memory_restart: '256M',
        max_restarts: '10',
        restart_delay: '1000',
    }]
}