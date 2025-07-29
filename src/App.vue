<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script setup>
</script>

<style>
/* Global styles for responsive design */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-x: hidden;
}

#app {
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height for mobile */
  overflow: hidden;
}

.app {
  height: 100%;
  width: 100%;
}

/* Ensure proper touch scrolling on mobile */
@media (max-width: 768px) {
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
  }
}

/* Prevent text selection on interactive elements */
button, a {
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

/* Ensure proper font rendering */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
