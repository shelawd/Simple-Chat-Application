<template>
  <div class="p-4 md:p-6">
    <div v-if="room" class="space-y-4 md:space-y-6">
      <!-- Avatar -->
      <div class="text-center">
        <img
          :src="room.user_avatar_url"
          :alt="room.name"
          class="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-3 md:mb-4 border-4 border-gray-200"
        />
        <h3 class="text-lg md:text-xl font-semibold text-gray-800">
          {{ room.name }}
        </h3>
        <p class="text-sm md:text-base text-gray-500 truncate px-2">
          {{ room.user_id }}
        </p>
      </div>

      <!-- Room Details -->
      <div class="bg-gray-50 rounded-lg p-3 md:p-4 space-y-2 md:space-y-3">
        <h4
          class="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base"
        >
          Room Information
        </h4>

        <div class="grid grid-cols-1 gap-2 md:gap-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600 text-sm md:text-base">Contact ID:</span>
            <span class="font-medium text-sm md:text-base">{{
              room.contact_id || "N/A"
            }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-gray-600 text-sm md:text-base">Room Type:</span>
            <span class="font-medium capitalize text-sm md:text-base">{{
              room.room_type
            }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-gray-600 text-sm md:text-base">Source:</span>
            <span class="font-medium capitalize text-sm md:text-base">{{
              room.source
            }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-gray-600 text-sm md:text-base">Status:</span>
            <span
              :class="[
                'px-2 py-1 rounded-full text-sm font-medium',
                room.is_resolved
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800',
              ]"
            >
              {{ room.is_resolved ? "Resolved" : "Active" }}
            </span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-gray-600 text-sm md:text-base">Waiting:</span>
            <span
              :class="[
                'px-2 py-1 rounded-full text-sm font-medium',
                room.is_waiting
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800',
              ]"
            >
              {{ room.is_waiting ? "Yes" : "No" }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 py-6 md:py-8">
      <p class="text-sm md:text-base">Room information not available</p>
    </div>
  </div>
</template>

<script setup>
import { useRoomStore } from "../stores/roomStore";
import { computed, defineProps } from "vue";

const props = defineProps({
  roomId: String,
});

const roomStore = useRoomStore();
const room = computed(() =>
  roomStore.rooms.find((r) => r.room_id === props.roomId)
);

function getSenderTypeLabel(senderType) {
  switch (senderType) {
    case "customer":
      return "Customer";
    case "system":
      return "System";
    case "admin":
      return "Agent";
    default:
      return "Unknown";
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  return date.toLocaleString();
}
</script>

<style scoped></style>
