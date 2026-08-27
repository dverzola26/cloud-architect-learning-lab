'use client'

import { useEffect, useMemo, useState } from 'react'
import './styles.css'

const lessons = [
  { id: 'filesystem', title: 'Linux Filesystem', duration: '15 min', architect: 'Understand where configs, logs, binaries, and application data usually live on Linux systems.', body: [
    ['Root directory', '`/` is the top of the Linux filesystem tree.'],
    ['Home directory', '`~` is a shortcut to your user home directory, usually `/home/<username>`.'],
    ['Common paths', '`/etc` configuration, `/var/log` logs, `/opt` optional applications, `/tmp` temporary files.']
  ], commands: ['pwd', 'ls /', 'ls /etc', 'ls /var/log'] },
  { id: 'navigation', title: 'Navigation', duration: '20 min', architect: 'Fast navigation matters when validating server builds and troubleshooting customer environments.', body: [
    ['pwd', 'Shows your current working directory.'], ['ls -la', 'Lists files including hidden files with permissions and ownership.'], ['cd', 'Moves between directories. `cd ..` goes to the parent, `cd ~` returns home.']
  ], commands: ['pwd', 'ls -la', 'cd /tmp', 'pwd', 'cd ~'] },
  { id: 'files', title: 'Files & Directories', duration: '25 min', architect: 'You will constantly create configuration directories, copy deployment artifacts, and inspect filesystem layouts.', body: [
    ['mkdir', 'Creates directories. Use `mkdir -p` for nested paths.'], ['touch', 'Creates an empty file.'], ['cp / mv', 'Copy and move or rename files.'], ['rm', 'Deletes files. Be careful with recursive and forced deletion.']
  ], commands: ['mkdir -p cloud-native-learning/{app,docker,kubernetes,monitoring,docs}', 'touch cloud-native-learning/README.md', 'cp cloud-native-learning/README.md cloud-native-learning/docs/README.backup', 'find cloud-native-learning'] },
  { id: 'viewing', title: 'Viewing Files', duration: '20 min', architect: 'Reading config files and logs is one of the first steps in production troubleshooting.', body: [
    ['cat', 'Best for short files.'], ['less', 'Best for large files you need to scroll through.'], ['head / tail', 'Show beginning or end of files. `tail -f` follows new log lines.'], ['redirects', '`>` overwrites output to a file; `>>` appends.']
  ], commands: ['cd ~/Projects/cloud-architect-learning-lab', 'mkdir -p cloud-native-learning/logs', 'echo "Cloud Native Learning" > cloud-native-learning/README.md', 'echo "Docker" >> cloud-native-learning/README.md', 'cat cloud-native-learning/README.md', 'printf "INFO Application started\nERROR Database timeout\n" > cloud-native-learning/logs/application.log', 'tail cloud-native-learning/logs/application.log'] },
  { id: 'search', title: 'Searching & Pipes', duration: '30 min', architect: 'Filtering noisy logs and command output is a core Linux troubleshooting skill.', body: [
    ['grep', 'Searches for text. Use `-i` for case-insensitive and `-r` for recursive search.'], ['pipe', 'The `|` pipe sends one command output into another command.'], ['find', 'Searches for files by name, path, type, and other attributes.']
  ], commands: ['cd ~/Projects/cloud-architect-learning-lab', 'mkdir -p cloud-native-learning/logs', 'printf "INFO Application starting\nINFO Database connected\nERROR Connection timeout\nINFO Retrying\nERROR Database unavailable\n" > cloud-native-learning/logs/application.log', 'grep -i error cloud-native-learning/logs/application.log', 'grep ERROR cloud-native-learning/logs/application.log | wc -l', 'ps aux | grep -E "[n]ginx|[p]ython"', 'find cloud-native-learning -name "*.yaml"'] },
  { id: 'permissions', title: 'Permissions', duration: '30 min', architect: 'Least privilege, ownership, and executable permissions affect security and application reliability.', body: [
    ['rwx', '`r` read, `w` write, `x` execute. Permissions apply to owner, group, and others.'], ['chmod', 'Changes file permissions. `chmod 755 script.sh` allows owner full access and others read/execute.'], ['chown', 'Changes file ownership.'], ['security', 'Avoid `777` on sensitive files because everyone gets full access.']
  ], commands: ['cd ~/Projects/cloud-architect-learning-lab', 'mkdir -p cloud-native-learning/scripts cloud-native-learning/security', 'printf "#!/bin/bash\necho \"Hello Cloud Architect\"\n" > cloud-native-learning/scripts/hello.sh', 'touch cloud-native-learning/security/private-key.pem cloud-native-learning/security/file.txt', 'ls -l cloud-native-learning/scripts/hello.sh', './cloud-native-learning/scripts/hello.sh  # Expected first attempt: Permission denied', 'chmod +x cloud-native-learning/scripts/hello.sh', './cloud-native-learning/scripts/hello.sh', 'chmod 600 cloud-native-learning/security/private-key.pem', 'sudo chown $USER:$USER cloud-native-learning/security/file.txt', 'ls -l cloud-native-learning/scripts/hello.sh cloud-native-learning/security/private-key.pem'] },
  { id: 'processes', title: 'Processes', duration: '25 min', architect: 'Applications, agents, databases, and container runtimes all become Linux processes you may need to inspect.', body: [
    ['ps aux', 'Lists running processes.'], ['top', 'Interactive CPU and memory view.'], ['kill', 'Sends a termination signal to a process. Prefer graceful termination before `kill -9`.']
  ], commands: ['sleep 500 &', 'ps aux | grep sleep', 'kill <PID>'] },
  { id: 'env', title: 'Environment Variables', duration: '20 min', architect: 'Externalized configuration lets the same application artifact run across DEV, UAT, and PROD.', body: [
    ['env', 'Lists current environment variables.'], ['export', 'Creates a variable for the current shell session.'], ['design', 'Avoid hardcoding environment-specific endpoints and credentials into application code.']
  ], commands: ['export APP_ENV=development', 'export APP_PORT=8080', 'echo "Application environment: $APP_ENV"', 'echo "Port: $APP_PORT"'] },
  { id: 'networking', title: 'Networking', duration: '40 min', architect: 'This is foundational for diagnosing cloud connectivity, routing, firewall, load balancer, DNS, and application-binding issues.', body: [
    ['ip addr', 'Shows interface IP addresses.'], ['ip route', 'Shows the routing table and default gateway.'], ['curl', 'Tests HTTP endpoints and APIs.'], ['ss -tulpn', 'Shows listening TCP/UDP sockets and associated processes.'], ['method', 'Process → listening port → localhost test → remote test → network/security controls.']
  ], commands: ['cd ~/Projects/cloud-architect-learning-lab/cloud-native-learning/app', 'ip addr', 'ip route', 'python3 -m http.server 8080  # Keep this terminal running', '# Open a second terminal', 'ss -tulpn | grep 8080', 'curl -I http://localhost:8080', '# Return to the server terminal and press Ctrl+C to stop it'] },
  { id: 'packages', title: 'Package Management', duration: '15 min', architect: 'Architects should recognize how Linux images and bootstrap scripts install software dependencies.', body: [
    ['apt', 'Ubuntu and Debian package manager.'], ['dnf/yum', 'Common on RHEL-family and EulerOS-family systems.'], ['repositories', 'Package managers retrieve signed packages and metadata from configured repositories.']
  ], commands: ['sudo apt update', 'apt search tree', 'sudo apt install -y tree', 'tree ~/Projects/cloud-architect-learning-lab/cloud-native-learning'] },
  { id: 'services', title: 'Services', duration: '25 min', architect: 'Most production workloads and platform agents run as managed services.', body: [
    ['systemctl', 'Controls services on systemd-based Linux systems.'], ['start vs enable', '`start` runs now; `enable` configures automatic startup after boot.'], ['status', 'Use status before deeper log inspection.']
  ], commands: ['systemctl status ssh || systemctl status sshd', 'command -v nginx || echo "Nginx is not installed yet"', '# Optional lab: install Nginx before managing it', 'sudo apt install -y nginx', 'sudo systemctl enable --now nginx', 'systemctl status nginx --no-pager'] },
  { id: 'logs', title: 'Logs', duration: '30 min', architect: 'Evidence-driven troubleshooting starts with service state and logs.', body: [
    ['journalctl', 'Reads systemd journal logs.'], ['/var/log', 'Traditional location for many Linux system and application logs.'], ['workflow', 'Problem → service status → logs → error → fix → restart → validate.']
  ], commands: ['journalctl -n 50 --no-pager', 'ls -la /var/log', '# If you completed the optional Nginx service lab:', 'journalctl -u nginx -n 20 --no-pager', 'journalctl -u nginx -f  # Press Ctrl+C to stop following logs'] },
  { id: 'lab', title: 'Linux Troubleshooting Lab', duration: '45 min', architect: 'Combine filesystem, process, networking, permissions, and logs into one realistic server-validation workflow.', body: [
    ['Scenario', 'Build a small lab directory, create logs, run a Python HTTP server, validate port 8080, execute a health-check script, and stop the process gracefully.'],
    ['Deliverable', 'You should be able to show the directory tree, error count, listening port, HTTP response, process PID, and clean shutdown.']
  ], commands: ['cd ~/Projects/cloud-architect-learning-lab', 'mkdir -p cloud-native-learning/{app,logs,scripts}', 'printf "INFO Starting application\nINFO Listening on port 8080\nWARNING High memory usage\nERROR Database connection failed\nINFO Retrying database connection\nERROR Database connection failed\n" > cloud-native-learning/logs/application.log', 'printf "#!/bin/bash\ncurl -I http://localhost:8080\n" > cloud-native-learning/scripts/healthcheck.sh', 'chmod +x cloud-native-learning/scripts/healthcheck.sh', 'tree cloud-native-learning', 'grep ERROR cloud-native-learning/logs/application.log | wc -l', 'cd cloud-native-learning/app && python3 -m http.server 8080  # Keep running; use a second terminal for the next commands', 'ss -tulpn | grep 8080', 'curl localhost:8080', 'cd ~/Projects/cloud-architect-learning-lab && ./cloud-native-learning/scripts/healthcheck.sh', 'ps aux | grep "[h]ttp.server"'] },
  { id: 'checkpoint', title: 'Final Checkpoint', duration: '30 min', architect: 'The checkpoint measures whether you can operate and reason, not just copy commands.', body: [
    ['Challenge 1', 'Find current directory, normal files, and hidden files.'], ['Challenge 2', 'Search a large configuration for `database_timeout`.'], ['Challenge 3', 'Investigate an unreachable web application expected on port 8080.'], ['Challenge 4', 'Fix `Permission denied` on a deployment script.'], ['Challenge 5', 'Explain why `-rwxrwxrwx` is unsafe on a credentials file.'], ['Challenge 6', 'Explain why a service does not start automatically after reboot.'], ['Challenge 7', 'Identify the first service-status and log commands you would normally use.']
  ], commands: [] }
]

const phases = [
  ['Foundations', 14], ['Docker', 0], ['Kubernetes', 0], ['Production Kubernetes', 0], ['Helm', 0], ['CI/CD', 0], ['Observability', 0], ['Troubleshooting', 0], ['Cloud Architecture', 0], ['Capstone', 0]
]

function Code({ children }) { return <code>{children}</code> }

function getCommandMeta(command) {
  const clean = command.replace(/\s+#.*$/, '').trim()
  if (command.trim().startsWith('#')) return { kind: 'instruction', what: command.replace(/^#\s*/, ''), expected: 'Follow this instruction before continuing to the next command.' }

  const rules = [
    [/^pwd$/, 'Prints the current working directory so you know exactly where the shell is operating.', 'Example output: /home/user/Projects/cloud-architect-learning-lab'],
    [/^ls -la$/, 'Lists all files, including hidden files, with permissions, owner, size, and timestamps.', 'Look for entries such as .git, .bashrc, or .ssh and read the permission column on the left.'],
    [/^ls \/$/, 'Lists the top-level directories under the Linux root filesystem.', 'You should see directories such as etc, home, tmp, usr, and var.'],
    [/^ls \/etc$/, 'Lists system and application configuration files stored under /etc.', 'Use this when locating service configuration such as SSH, DNS, or package-manager settings.'],
    [/^ls \/var\/log$/, 'Lists logs stored in the traditional Linux log directory.', 'Useful when a service or OS component writes file-based logs instead of only using the systemd journal.'],
    [/^cd /, 'Changes your current working directory.', 'Run pwd after cd when you want to verify where you landed.'],
    [/^mkdir -p /, 'Creates directories. The -p option also creates missing parent directories and does not fail if they already exist.', 'This is common in setup scripts because it safely builds a required directory structure.'],
    [/^touch /, 'Creates an empty file if it does not exist, or updates its timestamp if it already exists.', 'Useful for preparing placeholder files before adding content.'],
    [/^cp /, 'Copies a file or directory from a source path to a destination path.', 'After copying, use ls or diff to verify the new copy exists and contains the expected data.'],
    [/^find /, 'Searches the filesystem below the specified path using criteria such as filename or type.', 'For example, -name "*.yaml" finds YAML files recursively.'],
    [/^echo .* > /, 'Writes text to a file using shell output redirection. A single > replaces the existing file content.', 'Caution: > overwrites the target file. Use >> when you intend to append instead.'],
    [/^echo .* >> /, 'Appends text to the end of an existing file using >> redirection.', 'Unlike >, existing file content is preserved.'],
    [/^printf /, 'Writes precisely formatted text. It is useful for creating small scripts, configuration files, or multiline lab data.', 'The \\n escape creates a new line. The final > path writes the generated content to a file.'],
    [/^cat /, 'Prints the complete contents of a text file to the terminal.', 'Best for small files; use less for large files that require scrolling.'],
    [/^tail /, 'Shows the last lines of a file. This is especially useful for recent log entries.', 'With tail -f, the terminal continues following new lines until you stop it with Ctrl+C.'],
    [/^grep -i /, 'Searches text case-insensitively and prints matching lines.', 'Useful when logs may contain ERROR, Error, or error with inconsistent capitalization.'],
    [/^grep ERROR .*\| wc -l$/, 'Finds lines containing ERROR, pipes those lines to wc, and counts them.', 'This demonstrates the Linux pipe: output from grep becomes input to wc.'],
    [/^grep ERROR /, 'Searches the target file and prints lines containing the exact text ERROR.', 'If nothing is printed, there were no exact matches.'],
    [/^ps aux \| grep /, 'Lists processes and filters the output to the process names you care about.', 'The patterns such as [p]ython avoid matching the grep command itself.'],
    [/^ps aux$/, 'Displays a detailed snapshot of running processes for all users.', 'Key fields include USER, PID, %CPU, %MEM, and the command being executed.'],
    [/^sleep \d+ &$/, 'Starts a harmless sleep process in the background so you can practice process discovery and termination.', 'The trailing & returns control to your shell immediately while the process keeps running.'],
    [/^kill <PID>$/, 'Sends the default TERM signal to the selected process, requesting a graceful shutdown.', 'Replace <PID> with the actual numeric PID you found using ps. Prefer this before kill -9.'],
    [/^export /, 'Creates or updates an environment variable for the current shell and processes launched from it.', 'The value normally disappears when the shell session ends unless it is configured in a startup file.'],
    [/^echo .*\$APP_/, 'Expands an environment variable inside a string and prints the resulting value.', 'This proves the application setting can be supplied externally rather than hardcoded.'],
    [/^ip addr$/, 'Shows network interfaces and their assigned IPv4/IPv6 addresses.', 'Look for the interface that has the IP used by your WSL or Linux environment.'],
    [/^ip route$/, 'Shows the routing table, including the default route used for destinations outside local networks.', 'A line beginning with default via typically identifies the default gateway.'],
    [/^python3 -m http\.server 8080/, 'Starts Python’s simple HTTP server on TCP port 8080 using the current directory as its document root.', 'Keep this terminal open. Requests to localhost:8080 should list or serve files from this directory.'],
    [/http\.server 8080/, 'Starts Python’s simple HTTP server on TCP port 8080 using the current directory as its document root.', 'Keep this terminal open and use a second terminal for validation commands.'],
    [/^ss -tulpn \| grep 8080$/, 'Lists listening TCP/UDP sockets and filters for port 8080.', 'You should see a LISTEN entry for the Python process while the test server is running.'],
    [/^curl -I /, 'Sends an HTTP request and displays response headers only.', 'A successful local test usually returns an HTTP status such as 200 OK.'],
    [/^curl localhost:8080$/, 'Sends an HTTP request to the local server on port 8080 and prints the response body.', 'If this works but remote access fails, investigate binding, firewall/security group, routing, NAT, or ACLs.'],
    [/^sudo apt update$/, 'Refreshes the local package index from configured Ubuntu/Debian repositories.', 'Run this before installing packages when the package metadata may be outdated.'],
    [/^apt search /, 'Searches available package metadata for a package name or description.', 'This does not install anything; it helps you find the correct package first.'],
    [/^sudo apt install -y /, 'Installs a package. The -y option automatically answers yes to confirmation prompts.', 'Use -y in repeatable labs or automation only when you already understand what will be installed.'],
    [/^tree /, 'Displays a directory hierarchy in an easy-to-read tree format.', 'Use it to validate that your lab structure matches the required layout.'],
    [/^systemctl status /, 'Shows whether a systemd service is active and displays recent status information.', 'This is usually one of the first commands to run when a Linux service is not working.'],
    [/^command -v /, 'Checks whether a command exists in your PATH and prints its executable location.', 'If the command is absent, the fallback echo explains that the package is not installed.'],
    [/^sudo systemctl enable --now /, 'Enables a systemd service to start automatically at boot and also starts it immediately.', 'This combines enable and start in a single command.'],
    [/^journalctl -n /, 'Shows the most recent entries from the systemd journal.', 'Use this for a quick view of recent system activity and errors.'],
    [/^journalctl -u .* -n /, 'Shows recent journal entries for one specific systemd service unit.', 'This reduces noise when troubleshooting a service such as Nginx.'],
    [/^journalctl -u .* -f/, 'Follows new journal entries for one service in real time.', 'Press Ctrl+C when you are finished watching the live log stream.'],
    [/^ls -la \/var\/log$/, 'Lists traditional log files with permission, owner, size, and timestamp information.', 'Use it to identify which logs are available on this particular Linux distribution.'],
    [/^chmod \+x /, 'Adds execute permission to a file, allowing it to be launched as a script or program.', 'This fixes Permission denied when the file contents are valid but the execute bit is missing.'],
    [/^chmod 600 /, 'Sets permissions so only the owner can read and write the file; group and others get no access.', 'This is a common permission model for private keys or sensitive credential files.'],
    [/^sudo chown /, 'Changes the owner and group of a file.', 'Use this when a file was created by another account, often root, and your application user needs ownership.'],
    [/^ls -l /, 'Lists detailed file metadata including permissions and ownership.', 'Use it before and after chmod/chown to prove the permission or ownership change.'],
    [/^\.\//, 'Executes a script or binary from a relative path beginning at the current directory.', 'If you receive Permission denied, inspect the execute permission with ls -l before changing anything.']
  ]

  const hit = rules.find(([pattern]) => pattern.test(clean))
  if (hit) return { kind: 'command', what: hit[1], expected: hit[2] }
  return { kind: 'command', what: 'Runs this shell command as the next step in the lab.', expected: 'Read the command carefully, run it, and compare the result with the lesson objective before continuing.' }
}

export default function Home() {
  const [active, setActive] = useState('filesystem')
  const [completed, setCompleted] = useState({})
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const c = localStorage.getItem('calab-completed')
    const n = localStorage.getItem('calab-notes')
    if (c) setCompleted(JSON.parse(c))
    if (n) setNotes(n)
  }, [])

  const markComplete = (id) => {
    const next = { ...completed, [id]: !completed[id] }
    setCompleted(next)
    localStorage.setItem('calab-completed', JSON.stringify(next))
  }

  const saveNotes = (value) => {
    setNotes(value)
    localStorage.setItem('calab-notes', value)
  }

  const lesson = lessons.find(l => l.id === active)
  const doneCount = Object.values(completed).filter(Boolean).length
  const moduleProgress = Math.round(doneCount / lessons.length * 100)
  const overallProgress = Math.round(moduleProgress / 10)

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">CA</div>
          <div><strong>Cloud Architect</strong><span>Learning Lab</span></div>
        </div>
        <nav>
          <a className="navItem active">Dashboard</a>
          <div className="navLabel">MODULE 1.1 · LINUX CLI</div>
          {lessons.map((l, i) => (
            <button key={l.id} onClick={() => setActive(l.id)} className={`lessonNav ${active === l.id ? 'selected' : ''}`}>
              <span className={completed[l.id] ? 'dot complete' : 'dot'}>{completed[l.id] ? '✓' : i + 1}</span>
              <span>{l.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">GUIDED LEARNING PROGRAM</p>
            <h1>Cloud Solutions Architect Learning Lab</h1>
          </div>
          <div className="overall"><span>Overall progress</span><strong>{overallProgress}%</strong></div>
        </header>

        <section className="heroGrid">
          <div className="card highlight">
            <div className="cardTop"><span>Current module</span><span className="badge">IN PROGRESS</span></div>
            <h2>Module 1.1 · Linux CLI Foundations</h2>
            <p>Build practical Linux confidence for cloud infrastructure, containers, Kubernetes, and production troubleshooting.</p>
            <div className="progressRow"><div className="progress"><i style={{width:`${moduleProgress}%`}} /></div><strong>{moduleProgress}%</strong></div>
            <small>{doneCount} of {lessons.length} lessons completed</small>
          </div>
          <div className="card scoreCard">
            <span>Target score</span>
            <strong>90+</strong>
            <p>Architect Ready</p>
            <div className="scoreBreakdown">Execution 40 · Troubleshooting 25 · Concepts 20 · Architecture 15</div>
          </div>
        </section>

        <section className="phaseCard card">
          <div className="sectionHeading"><div><span>ROADMAP</span><h3>Phase progress</h3></div></div>
          <div className="phaseGrid">
            {phases.map(([name, base], i) => {
              const value = i === 0 ? moduleProgress : base
              return <div className="phase" key={name}><div><span>{String(i+1).padStart(2,'0')}</span><strong>{name}</strong><em>{value}%</em></div><div className="miniProgress"><i style={{width:`${value}%`}} /></div></div>
            })}
          </div>
        </section>

        <section className="lessonLayout">
          <article className="card lessonCard">
            <div className="lessonHeader">
              <div><p className="eyebrow">MODULE 1.1</p><h2>{lesson.title}</h2><span className="duration">Estimated · {lesson.duration}</span></div>
              <button className={completed[lesson.id] ? 'completeBtn done' : 'completeBtn'} onClick={() => markComplete(lesson.id)}>{completed[lesson.id] ? '✓ Completed' : 'Mark complete'}</button>
            </div>

            <div className="architectBox"><strong>Architect View</strong><p>{lesson.architect}</p></div>

            <div className="lessonSections">
              {lesson.body.map(([title, text]) => <div className="concept" key={title}><h4>{title}</h4><p>{text.split(/(`[^`]+`)/).map((part, idx) => part.startsWith('`') ? <Code key={idx}>{part.slice(1,-1)}</Code> : part)}</p></div>)}
            </div>

            {lesson.commands.length > 0 && <>
              <div className="commandSectionHeader">
                <div><p className="eyebrow">GUIDED LAB</p><h3 className="subheading">Hands-on command guide</h3></div>
                <p>Run the steps in order. Read the explanation before executing each command so you understand what the command proves.</p>
              </div>
              <div className="commandGuide">
                {lesson.commands.map((c, index) => {
                  const meta = getCommandMeta(c)
                  if (meta.kind === 'instruction') return (
                    <div className="commandInstruction" key={`${c}-${index}`}>
                      <span className="stepNumber">{index + 1}</span>
                      <div><strong>Instruction</strong><p>{meta.what}</p><small>{meta.expected}</small></div>
                    </div>
                  )
                  return (
                    <div className="commandStep" key={`${c}-${index}`}>
                      <div className="commandStepTop"><span className="stepNumber">{index + 1}</span><span className="stepLabel">COMMAND</span></div>
                      <div className="terminal compact">
                        <div className="terminalTop"><span></span><span></span><span></span><em>ubuntu · bash</em></div>
                        <pre>$ {c}</pre>
                      </div>
                      <div className="commandExplanation">
                        <div><strong>What it does</strong><p>{meta.what}</p></div>
                        <div><strong>Example / expected result</strong><p>{meta.expected}</p></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>}

            <div className="checkpointBox">
              <div><span>CHECKPOINT</span><h3>Can you do this without copying?</h3></div>
              <p>Run the lesson commands, explain what each command proves, then mark the lesson complete. For troubleshooting lessons, record the symptom, evidence, root cause, and fix.</p>
            </div>
          </article>

          <aside className="rightRail">
            <div className="card sticky">
              <span className="eyebrow">MY NOTES</span>
              <h3>Learning journal</h3>
              <textarea value={notes} onChange={e => saveNotes(e.target.value)} placeholder="Write what you learned, commands worth remembering, or questions to review..." />
              <small>Saved automatically in this browser.</small>
            </div>
            <div className="card">
              <span className="eyebrow">CHECKPOINT STATUS</span>
              <h3>{completed[lesson.id] ? 'Completed' : 'Not completed'}</h3>
              <p>{completed[lesson.id] ? 'Good. You can revisit this lesson anytime. Next, continue to the next incomplete lesson.' : 'Complete the explanation, commands, and checkpoint before moving on.'}</p>
            </div>
          </aside>
        </section>
      </section>
    </main>
  )
}
