import { initPoolCreationProcessor } from "./deepbook/poolCreationProcessor.js";
import { initOrderEventsProcessor } from "./deepbook/orderEventsProcessor.js";

// 1) Index all pool creations first
initPoolCreationProcessor()

// 2) Index all subsequent order/fill events that rely on the pool cache
initOrderEventsProcessor() 