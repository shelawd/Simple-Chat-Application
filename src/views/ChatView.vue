<template>
  <div class="flex flex-col h-full">
    <!-- Chat Messages Area -->
    <div class="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50" ref="chatContainer">
      <!-- Loading state -->
      <div v-if="!roomStore.activeRoomId" class="flex items-center justify-center h-full">
        <div class="text-center text-gray-500">
          <p>Select a chat room to start messaging</p>
        </div>
      </div>
      
      <!-- Messages -->
      <div
        v-else-if="roomStore.activeRoomMessages && roomStore.activeRoomMessages.length > 0"
        v-for="message in roomStore.activeRoomMessages"
        :key="message.id"
        :class="[
          'flex',
          getMessageAlignment(message.sender)
        ]"
      > 
        <!-- Text Message -->
        <div
          v-if="message.type === 'text'"
          :class="[
            'max-w-[85%] md:max-w-[70%] px-3 md:px-4 py-2 md:py-3 rounded-2xl shadow-sm',
            getMessageBubbleStyle(message.sender)
          ]"
        >
          <p class="text-sm">{{ message.text }}</p>
          <p 
            :class="[
              'text-xs mt-1',
              getMessageTimeStyle(message.sender)
            ]"
          >
            {{ formatMessageTime(message.timestamp) }}
          </p>
        </div>

        <!-- Product Message -->
        <div
          v-else-if="message.type === 'product'"
          :class="[
            'max-w-[280px] md:max-w-[320px] rounded-2xl shadow-lg overflow-hidden',
            getMessageBubbleStyle(message.sender)
          ]"
        >
          <div class="p-3 md:p-4">
            <div class="flex items-start gap-3">
              <img 
                :src="message.product.image" 
                :alt="message.product.name"
                class="w-14 h-14 md:w-16 md:h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-sm truncate" :class="getProductTitleStyle(message.sender)">
                  {{ message.product.name }}
                </h4>
                <p class="text-xs mt-1 line-clamp-2" :class="getProductDescriptionStyle(message.sender)">
                  {{ message.product.description }}
                </p>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-base md:text-lg font-bold" :class="getProductPriceStyle(message.sender)">
                    {{ message.product.price }}
                  </span>
                  <button 
                    class="text-xs px-2 md:px-3 py-1 rounded-full transition-colors"
                    :class="getProductButtonStyle(message.sender)"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p class="text-xs px-3 md:px-4 pb-2" :class="getMessageTimeStyle(message.sender)">
            {{ formatMessageTime(message.timestamp) }}
          </p>
        </div>
      </div>
      
      <!-- Empty state when room is selected but no messages -->
      <div v-else-if="roomStore.activeRoomId && (!roomStore.activeRoomMessages || roomStore.activeRoomMessages.length === 0)" class="flex items-center justify-center h-full">
        <div class="text-center text-gray-500">
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="border-t bg-white p-3 md:p-4">
      <form @submit.prevent="sendMessage" class="flex items-center gap-2 md:gap-3">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type a message..."
          class="flex-1 border border-gray-300 rounded-full px-3 md:px-4 py-2 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :disabled="!roomStore.activeRoomId"
        />
        <button
          type="submit"
          :disabled="!newMessage.trim() || !roomStore.activeRoomId"
          class="bg-blue-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-1 md:gap-2 text-sm"
        >
          <span class="hidden sm:inline">Send</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </button>
        <button
          type="button"
          @click="sendProductMessage"
          :disabled="!roomStore.activeRoomId"
          class="bg-green-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
          title="Send sample product"
        >
          Product 📦
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useRoomStore } from "../stores/roomStore";

const route = useRoute();
const roomStore = useRoomStore();
const newMessage = ref("");
const chatContainer = ref(null);



// Mengatur room yang aktif
watch(() => route.params.roomId, (newRoomId) => {
  if (newRoomId) {
    roomStore.setActiveRoom(newRoomId);
  }
}, { immediate: true });


watch(() => roomStore.activeRoomMessages, (messages) => {
  nextTick(() => {
    scrollToBottom();
  });
}, { deep: true });

// Style bubble chat customer/sistem
function getMessageAlignment(sender) {
  switch (sender) {
    case 'me':
    case 'system':
      return 'justify-end';
    case 'customer':
      return 'justify-start';
    default:
      return 'justify-start';
  }
}

function getMessageBubbleStyle(sender) {
  switch (sender) {
    case 'me':
      return 'bg-blue-500 text-white rounded-br-md';
    case 'system':
      return 'bg-blue-500 text-white rounded-br-md';
    case 'customer':
      return 'bg-white text-gray-800 rounded-bl-md border border-gray-200';
    default:
      return 'bg-white text-gray-800 rounded-bl-md border border-gray-200';
  }
}

function getMessageTimeStyle(sender) {
  switch (sender) {
    case 'me':
      return 'text-blue-100';
    case 'system':
      return 'text-gray-300';
    case 'customer':
      return 'text-gray-500';
    default:
      return 'text-gray-500';
  }
}

function getProductTitleStyle(sender) {
  switch (sender) {
    case 'me':
    case 'system':
      return 'text-white';
    case 'customer':
      return 'text-gray-900';
    default:
      return 'text-gray-900';
  }
}

function getProductDescriptionStyle(sender) {
  switch (sender) {
    case 'me':
      return 'text-blue-100';
    case 'system':
      return 'text-gray-300';
    case 'customer':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
}

function getProductPriceStyle(sender) {
  switch (sender) {
    case 'me':
    case 'system':
      return 'text-white';
    case 'customer':
      return 'text-blue-600';
    default:
      return 'text-blue-600';
  }
}

function getProductButtonStyle(sender) {
  switch (sender) {
    case 'me':
      return 'bg-white text-blue-500 hover:bg-blue-50';
    case 'system':
      return 'bg-white text-gray-500 hover:bg-gray-50';
    case 'customer':
      return 'bg-blue-500 text-white hover:bg-blue-600';
    default:
      return 'bg-blue-500 text-white hover:bg-blue-600';
  }
}

// Mengirim pesan 
function sendMessage() {
  if (!newMessage.value.trim() || !roomStore.activeRoomId) return;
  
  roomStore.addMessage(roomStore.activeRoomId, newMessage.value.trim());
  newMessage.value = "";
}

// Mengirim produk
function sendProductMessage() {
  if (!roomStore.activeRoomId) return;
  
  const sampleProducts = [
    {
      image: 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=Headphones',
      name: 'Premium Wireless Headphones',
      price: '$299.99',
      description: 'High-quality wireless headphones with noise cancellation'
    },
    {
      image: 'https://via.placeholder.com/150x150/10B981/FFFFFF?text=Smartphone',
      name: 'Latest Smartphone Pro',
      price: '$999.99',
      description: 'Latest smartphone with advanced camera and performance'
    },
    {
      image: 'https://via.placeholder.com/150x150/F59E0B/FFFFFF?text=Laptop',
      name: 'Ultra Slim Laptop',
      price: '$1,299.99',
      description: 'Ultra-slim laptop perfect for work and entertainment'
    }
  ];
  
  const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
  roomStore.addProductMessage(roomStore.activeRoomId, randomProduct);
}

// Scroll ke bottom
function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
}

// Format waktu pesan
function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
</script>
