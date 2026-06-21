Replace your existing index.html with this fixed version.

What was fixed:
- The decorative entry-screen glow layer was sitting above the “Open the story” button and intercepting clicks/taps.
- Decorative entry layers are now pointer-events: none.
- The opening content is explicitly above all decorative layers.
- A mobile/touch fallback was added for the entry screen.

If you want the existing ambient music to play, keep ambient-score.mp3 in the same folder as index.html.
