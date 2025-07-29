import { defineStore } from "pinia";

export const useRoomStore = defineStore("room", {
  state: () => ({
    rooms: [],
    activeRoomId: null,
    messages: {}, 
  }),
  actions: {
    async loadRooms() {
      try {
        const res = await fetch("/data/list_rooms.json");
        const json = await res.json();
        this.rooms = json.data.customer_rooms;
        
        // Load saved messages from localStorage
        this.loadMessagesFromStorage();
        
        // Create initial messages for all rooms
        this.createInitialMessagesForAllRooms();
        
        console.log('✅ Rooms loaded:', this.rooms.length);
        console.log('✅ Messages loaded:', Object.keys(this.messages));
      } catch (error) {
        console.error("Error loading rooms:", error);
        this.rooms = [];
      }
    },
    
    // Load messages from localStorage
    loadMessagesFromStorage() {
      try {
        const savedMessages = localStorage.getItem('chat-messages');
        if (savedMessages) {
          this.messages = JSON.parse(savedMessages);
          console.log('📥 Loaded messages from localStorage:', Object.keys(this.messages));
        } else {
          console.log('📥 No saved messages found in localStorage');
        }
      } catch (error) {
        console.error("Error loading messages from storage:", error);
        this.messages = {};
      }
    },
    
    // Save messages to localStorage
    saveMessagesToStorage() {
      try {
        const messageData = JSON.stringify(this.messages);
        localStorage.setItem('chat-messages', messageData);
        console.log('💾 Saved messages to localStorage:', Object.keys(this.messages));
        console.log('💾 Data size:', messageData.length, 'characters');
        
        // Verify the save worked
        const saved = localStorage.getItem('chat-messages');
        if (saved) {
          console.log('✅ localStorage save verified');
        } else {
          console.log('❌ localStorage save failed');
        }
      } catch (error) {
        console.error("Error saving messages to storage:", error);
      }
    },
    
    // Create initial messages for all rooms
    createInitialMessagesForAllRooms() {
      console.log('🔄 Creating initial messages for all rooms...');
      
      this.rooms.forEach(room => {
        if (!this.messages[room.room_id]) {
          console.log('📝 Creating messages for room:', room.room_id, room.name);
          this.messages[room.room_id] = this.createInitialMessages(room);
        }
      });
      
      // Save to localStorage after creating all messages
      this.saveMessagesToStorage();
    },
    
    setActiveRoom(id) {
      console.log('🎯 Setting active room:', id);
      this.activeRoomId = id;
      
      // Ensure messages exist for this room
      if (!this.messages[id]) {
        const room = this.rooms.find(r => r.room_id === id);
        if (room) {
          console.log('📝 Creating messages for room:', id);
          this.messages[id] = this.createInitialMessages(room);
          this.saveMessagesToStorage();
        }
      } else {
        console.log('📋 Messages already exist for room:', id, 'count:', this.messages[id].length);
      }
    },
    
    addMessage(roomId, message) {
      if (!this.messages[roomId]) {
        this.messages[roomId] = [];
      }
      this.messages[roomId].push({
        id: Date.now(),
        text: message,
        sender: 'me',
        timestamp: new Date().toISOString(),
        type: 'text'
      });
      this.saveMessagesToStorage();
    },
    
    addProductMessage(roomId, product) {
      if (!this.messages[roomId]) {
        this.messages[roomId] = [];
      }
      this.messages[roomId].push({
        id: Date.now(),
        sender: 'me', 
        timestamp: new Date().toISOString(),
        type: 'product',
        product: product
      });
      this.saveMessagesToStorage();
    },
    
    createInitialMessages(room) {
      console.log('📋 Creating initial messages for room:', room.name);
      console.log('📋 Room data:', {
        last_comment_text: room.last_comment_text,
        last_comment_sender_type: room.last_comment_sender_type,
        last_comment_timestamp: room.last_comment_timestamp
      });
      
      const messages = [];
      
      // Add the last comment based on sender type
      if (room.last_comment_text) {
        const isSystemMessage = room.last_comment_sender_type === 'system';
        const sender = isSystemMessage ? 'system' : 'customer';
        
        messages.push({
          id: 1,
          text: room.last_comment_text,
          sender: sender,
          timestamp: room.last_comment_timestamp || new Date(Date.now() - 1800000).toISOString(),
          type: 'text'
        });
        
        console.log('📝 Added message:', {
          text: room.last_comment_text,
          sender: sender,
          type: room.last_comment_sender_type
        });
      }

      // Add product message for some rooms (consistent based on room_id)
      const seed = room.room_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const randomValue = (seed * 9301 + 49297) % 233280;
      const normalizedRandom = randomValue / 233280;
      
      if (normalizedRandom > 0.5) {
        messages.push({
          id: 2,
          sender: 'system',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          type: 'product',
          product: {
            image: 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=Product',
            name: 'Premium Wireless Headphones',
            price: '$299.99',
            description: 'High-quality wireless headphones with noise cancellation'
          }
        });
        console.log('📦 Added product message');
      }

      console.log('✅ Created', messages.length, 'initial messages for room:', room.name);
      return messages;
    }
  },
  getters: {
    activeRoom() {
      return this.rooms.find((r) => r.room_id === this.activeRoomId);
    },
    activeRoomMessages() {
      const messages = this.messages[this.activeRoomId] || [];
      console.log('💬 Active room messages for', this.activeRoomId, ':', messages.length, 'messages');
      return messages;
    }
  },
});
