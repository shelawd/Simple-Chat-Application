<template>
  <div class="h-full flex flex-col">
    <!-- Desktop Header -->
    <div class="hidden md:block p-4 border-b bg-white">
      <h2 class="text-lg font-bold text-gray-800 mb-3">Chat Rooms</h2>
      
      <!-- Filter buttons -->
      <div class="flex flex-wrap gap-2 mb-3">
        <button 
          @click="activeFilter = 'all'"
          :class="[
            'text-xs px-3 py-1 rounded-full transition-colors',
            activeFilter === 'all' 
              ? 'bg-[#065084] text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          All
        </button>
        <button 
          @click="activeFilter = 'waiting'"
          :class="[
            'text-xs px-3 py-1 rounded-full transition-colors',
            activeFilter === 'waiting' 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          Waiting
        </button>
        <button 
          @click="activeFilter = 'resolved'"
          :class="[
            'text-xs px-3 py-1 rounded-full transition-colors',
            activeFilter === 'resolved' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          Resolved
        </button>
      </div>
    </div>
    
    <!-- Mobile Header -->
    <div class="md:hidden p-4 border-b bg-white">
      <h2 class="text-lg font-bold text-gray-800 mb-3">Chat Rooms</h2>
      
      <!-- Filter buttons -->
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button 
          @click="activeFilter = 'all'"
          :class="[
            'text-xs px-3 py-2 rounded-full transition-colors whitespace-nowrap',
            activeFilter === 'all' 
              ? 'bg-[#065084] text-white' 
              : 'bg-white text-gray-600 border border-gray-200'
          ]"
        >
          All
        </button>
        <button 
          @click="activeFilter = 'waiting'"
          :class="[
            'text-xs px-3 py-2 rounded-full transition-colors whitespace-nowrap',
            activeFilter === 'waiting' 
              ? 'bg-red-500 text-white' 
              : 'bg-white text-gray-600 border border-gray-200'
          ]"
        >
          Waiting
        </button>
        <button 
          @click="activeFilter = 'resolved'"
          :class="[
            'text-xs px-3 py-2 rounded-full transition-colors whitespace-nowrap',
            activeFilter === 'resolved' 
              ? 'bg-green-500 text-white' 
              : 'bg-white text-gray-600 border border-gray-200'
          ]"
        >
          Resolved
        </button>
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto">
      <div class="p-2 md:p-4 space-y-1 md:space-y-2">
        <div
          v-for="room in filteredRooms"
          :key="room.room_id"
          class="cursor-pointer"
        >
          <router-link
            :to="`/chat/${room.room_id}`"
            @click="roomStore.setActiveRoom(room.room_id)"
            :class="[
              'flex items-center gap-3 p-3 rounded-lg transition-colors duration-200',
              roomStore.activeRoomId === room.room_id 
                ? 'bg-blue-100 border-l-4 border-blue-500' 
                : 'hover:bg-gray-100'
            ]"
          >
            <div class="relative">
              <img 
                :src="room.user_avatar_url" 
                :alt="room.name"
                class="w-12 h-12 md:w-10 md:h-10 rounded-full object-cover border-2 border-gray-200 flex-shrink-0" 
              />
              <!-- Status -->
              <div class="absolute -top-1 -right-1 flex gap-1">
                <div v-if="room.is_waiting" class="w-2 h-2 bg-red-500 rounded-full"></div>
                <div v-if="room.is_calling" class="w-2 h-2 bg-green-500 rounded-full"></div>
                <div v-if="room.is_resolved" class="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
            
            <div class="overflow-hidden flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="font-medium text-sm md:text-sm truncate text-gray-900">{{ room.name }}</p>
                <!-- Bot -->
                <span v-if="room.is_handled_by_bot" class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  Bot
                </span>
                <!-- Resolved -->
                <span v-if="room.is_resolved" class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Resolved
                </span>
              </div>
              
              <p class="text-xs text-gray-500 truncate mt-1">
                <span :class="getSenderTypeColor(room.last_comment_sender_type)">
                  {{ getSenderTypeLabel(room.last_comment_sender_type) }}:
                </span>
                {{ room.last_comment_text || 'No messages yet' }}
              </p>
              
              <p class="text-xs text-gray-400 mt-1">
                {{ formatTimestamp(room.last_comment_timestamp) }}
              </p>
            </div>
          </router-link>
        </div>
        
        <!-- Jika room kosong -->
        <div v-if="filteredRooms.length === 0" class="text-center text-gray-500 py-8">
          <p>No rooms match the selected filter.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoomStore } from "../stores/roomStore";

const roomStore = useRoomStore();
const activeFilter = ref('all');

const filteredRooms = computed(() => {
  switch (activeFilter.value) {
    case 'waiting':
      return roomStore.rooms.filter(room => room.is_waiting);
    case 'resolved':
      return roomStore.rooms.filter(room => room.is_resolved);
    case 'bot':
      return roomStore.rooms.filter(room => room.is_handled_by_bot);
    default:
      return roomStore.rooms;
  }
});

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function getSenderTypeLabel(senderType) {
  switch (senderType) {
    case 'customer':
      return 'Customer';
    case 'system':
      return 'System';
    case 'admin':
      return 'Agent';
    default:
      return 'Unknown';
  }
}

function getSenderTypeColor(senderType) {
  switch (senderType) {
    case 'customer':
      return 'text-blue-600';
    case 'system':
      return 'text-gray-600';
    case 'admin':
      return 'text-green-600';
    default:
      return 'text-gray-500';
  }
}

onMounted(async () => {
  await roomStore.loadRooms();
});
</script>
