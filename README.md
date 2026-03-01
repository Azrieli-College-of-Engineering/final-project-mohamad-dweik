<h1 align="center">Insecure Deserialization Attack – Proof of Concept</h1>

<p align="center">
Demonstration of privilege escalation via insecure session deserialization.
</p>

<hr>

<h2>Overview</h2>

<p>
This project demonstrates an <b>Insecure Deserialization</b> vulnerability in a web application.
Session data is stored inside a client-side cookie using Python <code>pickle</code>.
Because the server later deserializes this cookie without verifying its integrity,
an attacker can modify the serialized data and escalate privileges to gain unauthorized admin access.
</p>

<hr>

<h2>Technology Stack</h2>

<ul>
  <li><b>Backend:</b> Python + Flask</li>
  <li><b>Frontend:</b> React (Vite)</li>
  <li><b>Session Storage:</b> Client-side Cookie</li>
  <li><b>Serialization Format:</b> Python Pickle</li>
</ul>

<hr>

<h2>Project Structure</h2>

<pre>
insecure_desr_poc/
 ├── app.py
 └── requirements.txt
  └── forge_cookie.py

frontend/

</pre>

<hr>

<h2>Running the Application</h2>

<h3>Backend</h3>

<pre>
cd insecure_desr_poc
pip install -r requirements.txt
python app.py
</pre>

<p>Backend runs at: <code>http://127.0.0.1:5000</code></p>

<h3>Frontend</h3>

<pre>
cd frontend
npm install
npm run dev
</pre>

<p>Frontend runs at: <code>http://127.0.0.1:5173</code></p>

<hr>

<h2>Attack Demonstration</h2>

<h3>Step 1 – Normal Login</h3>
<p>Login through the frontend. The user initially does not have admin privileges.</p>

<h3>Step 2 – Extract Session Cookie</h3>
<p>Open Browser Developer Tools → Application → Cookies and copy the <code>session</code> cookie value.</p>

<h3>Step 3 – Recon Phase</h3>

<pre>
python insecure_desr_poc/forge_cookie.py recon --cookie &lt;cookie_value&gt;
</pre>

<p>This reveals the internal session structure, for example:</p>

<pre>
{'user': 'alice', 'is_admin': False}
</pre>

<h3>Step 4 – Forge Admin Cookie</h3>

<pre>
python insecure_desr_poc/forge_cookie.py forge --user &lt;user_name&gt; --admin
</pre>

<p>This generates a serialized cookie with elevated privileges.</p>

<h3>Step 5 – Replace Cookie</h3>
<p>Replace the <code>session</code> cookie in the browser with the forged value and refresh the dashboard.  
Admin access is now granted.</p>

<hr>

<h2>Root Cause</h2>

<ul>
  <li>Session data is stored client-side.</li>
  <li>The server deserializes user-controlled data.</li>
  <li>No integrity verification mechanism is applied.</li>
  <li>Authorization decisions rely on mutable client-side state.</li>
</ul>

<hr>

<h2>Disclaimer</h2>

<p>
This project is intended for educational purposes only and demonstrates insecure design patterns in a controlled environment.
</p>
