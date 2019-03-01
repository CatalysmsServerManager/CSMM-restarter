const rq = require('request-promise-native');
const {
    exec
} = require('child_process');

const config = require('./config.json');

// CSMM might need longer than the configured check interval to reboot.
var restarting = false;

main();


async function main() {
    let interval = setInterval(async () => {

        try {
            let response = await rq(config.url);
            // Check if the response includes a certain string, if it doesn't we are likely on a error page (cloudflare for example)
            if (!response.includes(config.stringToCheck)) {
                restart();
            }
        } catch (error) {
            // If request fails, it means the site is down -> restart.
            restart();
        }

    }, config.interval)
}


async function restart() {
    if (!restarting) {
        restarting = true;
        exec(config.restartCommand, () => {
            setTimeout(() => {
                restarting = false;
            }, config.restartCooldown)
        })
    }
}