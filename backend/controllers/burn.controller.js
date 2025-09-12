export const burnMemory = (req, res) => {
    // Get memory allocation size from query parameter (default: 100MB)
    const sizeMB = Math.min(parseInt(req.query.size) || 100, 400); // Cap at 400MB for safety
    const bytesToAllocate = sizeMB * 1024 * 1024; // Convert MB to bytes
    const chunkSize = 1024; // 1KB chunks
    const numberOfChunks = Math.floor(bytesToAllocate / chunkSize);
    
    const memoryLeak = [];
    for (let i = 0; i < numberOfChunks; i++) {
        memoryLeak.push(new Array(chunkSize / 4).fill(Math.random())); // Divide by 4 since each element is ~4 bytes
    }
    
    // Get memory usage
    const memUsage = process.memoryUsage();
    
    res.json({
        message: `Allocated approximately ${sizeMB}MB`,
        chunks: memoryLeak.length,
        memoryUsage: {
            rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
        }
    });
    
    // Clean up after 10 seconds to prevent permanent memory leak
    setTimeout(() => {
        memoryLeak.length = 0;
        global.gc && global.gc(); // Force garbage collection if available
    }, 10000);
}

export const burnRPS = (req, res) => {
    res.send(`Pong`);
}