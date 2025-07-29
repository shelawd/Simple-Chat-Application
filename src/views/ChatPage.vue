<template>
  <div class="h-screen flex flex-col md:flex-row overflow-hidden bg-gray-100">
    <!-- Sidebar Room List (kiri) - Mobile: full width, Tablet+: 1/3 -->
    <aside 
      :class="[
        'bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
        'md:w-1/3 lg:w-1/4 xl:w-1/5 md:relative md:translate-x-0',
        isSidebarOpen ? 'w-full absolute inset-0 z-40' : 'w-0 md:w-1/3 lg:w-1/4 xl:w-1/5 absolute md:relative -translate-x-full md:translate-x-0'
      ]"
    >
      <!-- Mobile Header for Sidebar -->
      <div class="md:hidden flex items-center justify-between p-4 border-b bg-white">
        <h2 class="text-lg font-bold text-gray-800">Chat Rooms</h2>
        <button 
          @click="toggleSidebar"
          class="p-2 rounded-lg hover:bg-gray-100"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <RoomList />
    </aside>

    <!-- Main Chat Area (kanan) - Mobile: full width, Tablet+: 2/3 -->
    <main class="flex-1 flex flex-col bg-white relative min-w-0">
      <template v-if="room">
        <!-- Header Chat -->
        <header 
          class="flex items-center gap-3 border-b p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 bg-white"
          @click="toggleProfile"
        >
          <!-- Mobile Menu Button -->
          <button 
            @click.stop="toggleSidebar"
            class="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          
          <img
            :src="room.user_avatar_url"
            :alt="room.name"
            class="w-10 h-10 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 truncate">{{ room.name }}</p>
            <p class="text-sm text-gray-500 truncate">{{ room.user_id }}</p>
          </div>
          <div class="flex items-center gap-2">
            <div v-if="room.is_waiting" class="w-2 h-2 bg-red-500 rounded-full"></div>
            <button 
              @click.stop="toggleProfile"
              class="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
              </svg>
            </button>
          </div>
        </header>

        <!-- Chat Content Area -->
        <div class="flex-1 flex min-h-0">
          <!-- Chat Messages dan Input -->
          <section class="flex-1 min-h-0">
            <ChatView />
          </section>
        </div>
      </template>

      <template v-else>
        <!-- Menampilkan di tampilan di tablet dan desktop -->
        <section class="hidden md:flex flex-1 items-center justify-center p-4">
          <div class="text-center">
            <HiThere />
          </div>
        </section>
        
        <!-- menampilkan daftar room chat di tampilan mobile -->
        <section class="md:hidden flex-1">
          <RoomList />
        </section>
      </template>

      <!-- Profile Panel (Overlay) -->
      <transition name="slide">
        <aside
          v-if="isProfileOpen && room"
          class="fixed top-0 right-0 w-80 sm:w-96 md:w-80 lg:w-96 h-full bg-white shadow-lg z-50 overflow-y-auto"
        >
          <div class="flex items-center justify-between p-4 border-b bg-white">
            <h2 class="text-lg font-bold text-gray-800">Room Profile</h2>
            <button
              class="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-black"
              @click="toggleProfile"
              aria-label="Close profile panel"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <Profile :roomId="room.room_id" />
        </aside>
      </transition>


    </main>

    <!-- Mobile (Overlay) -->
    <div 
      v-if="isSidebarOpen" 
      @click="toggleSidebar"
      class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
    ></div>
  </div>
</template>

<script setup>
import RoomList from "./RoomListView.vue";
import ChatView from "./ChatView.vue";
import HiThere from "../components/HiThere.vue";
import Profile from "./Profile.vue";

import { useRoomStore } from "../stores/roomStore";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const roomStore = useRoomStore();
const isProfileOpen = ref(false);
const isSidebarOpen = ref(false);

const room = computed(() => roomStore.activeRoom);

// Perubahan route untuk mengatur room yang aktif
watch(() => route.params.roomId, (newRoomId) => {
  if (newRoomId) {
    roomStore.setActiveRoom(newRoomId);
    // Close sidebar di mobile
    isSidebarOpen.value = false;
  }
}, { immediate: true });

function toggleProfile() {
  isProfileOpen.value = !isProfileOpen.value;
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* Scrolling on mobile */
@media (max-width: 768px) {
  .h-screen {
    height: 100vh;
    height: 100dvh; 
  }
}
</style>
