import { getServiceInfo } from './processCheck';

export async function showStatus() {
    const info = await getServiceInfo();
    
    console.log('\n📊 Claude Code Router Status');
    if (info.devMode) {
        console.log('🔧 Development Mode');
    }
    console.log('═'.repeat(40));
    
    if (info.running) {
        console.log('✅ Status: Running');
        console.log(`🆔 Process ID: ${info.pid}`);
        console.log(`🌐 Port: ${info.port}`);
        console.log(`📡 API Endpoint: ${info.endpoint}`);
        console.log(`📄 PID File: ${info.pidFile}`);
        if (info.devMode) {
            console.log(`📁 Config Directory: ${info.pidFile.replace('/.claude-code-router.pid', '')}`);
        }
        console.log('');
        console.log('🚀 Ready to use! Run the following commands:');
        console.log('   ccr code    # Start coding with Claude');
        console.log('   ccr stop   # Stop the service');
    } else {
        console.log('❌ Status: Not Running');
        console.log('');
        console.log('💡 To start the service:');
        console.log('   ccr start');
        if (info.devMode) {
            console.log('   npm run dev  # Start in development mode');
        }
    }
    
    console.log('');
}
