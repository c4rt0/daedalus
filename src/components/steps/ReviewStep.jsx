import { useWizard } from '../../hooks/useWizardState'

export default function ReviewStep() {
  const { state } = useWizard()

  const image = state.customBaseImage || state.baseImage

  const hasNoLogin = !state.users.some(u => u.name && (u.sshKeys || u.passwordHash))

  return (
    <div className="step">
      <h2>Review</h2>
      <p className="step-description">
        Here is a summary of your configuration.
      </p>

      {hasNoLogin && (
        <div className="warning-banner">
          <strong>No login configured!</strong> You haven't set up any user
          with an SSH key or password hash. You won't be able to log into
          the system after deployment. Go back to the <strong>Users</strong> step
          to add credentials.
        </div>
      )}

      <div className="review-grid">
        <ReviewSection title="Base Image">
          <code>{image}</code>
        </ReviewSection>

        {(state.osName || state.hostname) && (
          <ReviewSection title="Identity">
            {state.osName && <div><strong>Name:</strong> {state.osName}</div>}
            {state.hostname && <div><strong>Hostname:</strong> {state.hostname}</div>}
            {state.purpose && <div><strong>Purpose:</strong> {state.purpose}</div>}
          </ReviewSection>
        )}

        {state.packages.length > 0 && (
          <ReviewSection title="Packages">
            <div className="package-tags">
              {state.packages.map(p => (
                <span key={p} className="tag">{p}</span>
              ))}
            </div>
            {state.customPackages && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Additional:</strong> {state.customPackages}
              </div>
            )}
          </ReviewSection>
        )}

        {(state.timezone !== 'UTC' || state.locale !== 'en_US.UTF-8') && (
          <ReviewSection title="Configuration">
            <div><strong>Timezone:</strong> {state.timezone}</div>
            <div><strong>Locale:</strong> {state.locale}</div>
          </ReviewSection>
        )}

        {state.enabledServices.length > 0 && (
          <ReviewSection title="Services">
            {state.enabledServices.join(', ')}
          </ReviewSection>
        )}

        {(state.firewall.services.length > 0 || state.firewall.ports.length > 0) && (
          <ReviewSection title="Firewall">
            {[...state.firewall.services, ...state.firewall.ports].join(', ')}
          </ReviewSection>
        )}

        {state.users.filter(u => u.name).length > 0 && (
          <ReviewSection title="Users">
            {state.users.filter(u => u.name).map(u => (
              <div key={u.name}>
                <strong>{u.name}</strong>
                {u.groups.length > 0 && <span> ({u.groups.join(', ')})</span>}
                {u.sshKeys && <span> — {u.sshKeys.split('\n').filter(k => k.trim().startsWith('ssh-')).length} SSH key(s)</span>}
                {u.passwordHash && <span> — password set</span>}
                {!u.sshKeys && !u.passwordHash && <span className="text-warn"> — no credentials!</span>}
              </div>
            ))}
          </ReviewSection>
        )}

        {state.systemdUnits.length > 0 && (
          <ReviewSection title="Systemd Units">
            {state.systemdUnits.map(u => (
              <div key={u.name}>
                <code>{u.name}</code>
                <span className={`unit-badge ${u.enabled ? 'enabled' : ''}`} style={{ marginLeft: '0.5rem' }}>
                  {u.enabled ? 'enabled' : 'disabled'}
                </span>
              </div>
            ))}
          </ReviewSection>
        )}

        {state.motd && (
          <ReviewSection title="MOTD">
            <pre className="review-motd">{state.motd}</pre>
          </ReviewSection>
        )}
      </div>

      <div className="next-steps">
        <h3>What's next</h3>

        <ol>
          <li>
            <strong>Download all files</strong> using the button
            in the preview panel. Save them in a new empty directory
            (e.g. <code>~/my-os/</code>).
          </li>
          <li>
            <strong>Install Podman</strong> if you don't have it:
            <pre>sudo dnf install podman</pre>
          </li>
          <li>
            <strong>Run the build script:</strong>
            <pre>{'chmod +x build.sh && ./build.sh'}</pre>
            <span className="form-hint">
              The script builds your container image, then lets you pick an
              output format (qcow2 VM, ISO, cloud image). It prints the exact
              QEMU and SSH commands at the end.
            </span>
          </li>
        </ol>

        <div className="troubleshoot-section">
          <h4>Troubleshooting</h4>
          <dl className="troubleshoot-list">
            <dt>DNS errors during build (<code>Could not resolve hostname</code>)</dt>
            <dd>
              The build script uses <code>--net=host</code> so the container
              shares your machine's DNS. If it still fails, check your network.
            </dd>
            <dt>SSH asks for password instead of using the key</dt>
            <dd>
              Browser downloads set open file permissions. Fix
              with <code>chmod 600 ./id_ed25519_*</code>. Also
              use <code>-o IdentitiesOnly=yes -i ./id_ed25519_USERNAME</code> to
              prevent SSH from trying other keys first.
            </dd>
            <dt><code>WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED</code></dt>
            <dd>
              Each rebuild generates new host keys.
              Clear the old one: <code>ssh-keygen -R '[localhost]:2222'</code>
            </dd>
          </dl>
        </div>

        <div className="docs-links">
          <h4>Learn more</h4>
          <ul>
            <li><a href="https://bootc.dev/bootc/" target="_blank" rel="noopener">bootc documentation</a> — bootable containers reference</li>
            <li><a href="https://github.com/osbuild/image-builder" target="_blank" rel="noopener">image-builder</a> — generates disk images from container images</li>
            <li><a href="https://docs.fedoraproject.org/en-US/fedora-coreos/" target="_blank" rel="noopener">Fedora CoreOS documentation</a> — getting started, provisioning, updates</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function ReviewSection({ title, children }) {
  return (
    <div className="review-section">
      <h4>{title}</h4>
      {children}
    </div>
  )
}
