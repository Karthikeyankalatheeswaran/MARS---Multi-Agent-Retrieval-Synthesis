import React from 'react';
import { motion } from 'framer-motion';
import {
  Box, Typography, Paper, Chip, useTheme, Avatar, Divider
} from '@mui/material';
import {
  Radar as PlannerIcon,
  Telescope as ScoutIcon,
  Cpu as AnalystIcon,
  ScrollText as ScribeIcon,
  ShieldCheck as CriticIcon,
  Activity, ArrowDown
} from 'lucide-react';

const agents = [
  {
    name: 'Query Planner',
    role: 'Planner',
    icon: PlannerIcon,
    desc: 'Analyzes user message — detects intent (Study/Research), classifies query complexity, and routes to the appropriate subsystem.',
    color: '#60A5FA'
  },
  {
    name: 'Information Scout',
    role: 'Scout',
    icon: ScoutIcon,
    desc: 'Searches sources. Retrieves information from Pinecone vector store (Student Mode) or scans academic archives like arXiv & Google Scholar (Research Mode).',
    color: '#A78BFA'
  },
  {
    name: 'Data Analyst',
    role: 'Analyst',
    icon: AnalystIcon,
    desc: 'Synthesizes raw data. Refines content, organizes key details, and structures information into a coherent response.',
    color: '#34D399'
  },
  {
    name: 'Response Scribe',
    role: 'Scribe',
    icon: ScribeIcon,
    desc: 'Formats the final answer. Ensuring optimal readability, appending citations [1], [2], and generating the final report.',
    color: '#F472B6'
  },
  {
    name: 'Quality Critic',
    role: 'Validator',
    icon: CriticIcon,
    desc: 'Verifies data integrity. Computes a confidence score (0-100%) against source material and identifies potential errors.',
    color: '#FBBF24'
  },
];

export default function WorkflowTab({ agentLogs }) {
  const theme = useTheme();

  return (
    <Box sx={{ py: 6, px: 3, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'transparent', border: '1px solid', borderColor: 'divider' }}>
          <Activity color={theme.palette.primary.main} />
        </Avatar>
        <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.02em', mb: 1 }}>
          Agent Workflow
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
          Live agent status and data flow
        </Typography>
      </Box>

      <Box sx={{ position: 'relative', pl: { xs: 2, md: 4 } }}>
        {/* Connection Line */}
        <Box sx={{ 
          position: 'absolute', 
          left: { xs: 24, md: 40 }, 
          top: 20, 
          bottom: 20, 
          width: 2, 
          bgcolor: 'divider',
          zIndex: 0 
        }} />

        {agents.map((agent, index) => {
           // Find log by name (fuzzy match)
           const log = agentLogs?.find(l => 
             l.agent?.toLowerCase().includes(agent.name.toLowerCase()) || 
             l.agent?.toLowerCase().includes(agent.role.toLowerCase())
           );
           const isActive = !!log;
           const isCompleted = log?.status === 'completed';
           const isError = log?.status === 'error';

           return (
             <Box 
               key={agent.name} 
               component={motion.div}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: index * 0.1 }}
               sx={{ mb: 6, position: 'relative', zIndex: 1, display: 'flex', gap: 3 }}
             >
               {/* Icon Node */}
               <Box sx={{ 
                 width: { xs: 16, md: 32 }, 
                 display: 'flex', 
                 flexDirection: 'column', 
                 alignItems: 'center' 
               }}>
                 <Paper elevation={0} sx={{ 
                   width: 48, 
                   height: 48, 
                   borderRadius: '50%', 
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'center',
                   bgcolor: 'background.paper',
                   border: '2px solid',
                   borderColor: isCompleted ? 'success.main' : isActive ? agent.color : 'divider',
                   boxShadow: isActive ? `0 0 15px ${agent.color}40` : 'none',
                   transition: 'all 0.3s'
                 }}>
                   <agent.icon size={20} color={isCompleted ? theme.palette.success.main : agent.color} />
                 </Paper>
               </Box>

               {/* Content Card */}
               <Paper 
                 elevation={0}
                 sx={{ 
                   flex: 1, 
                   p: 3, 
                   borderRadius: 4, 
                   border: '1px solid',
                   borderColor: isActive ? `${agent.color}50` : 'divider',
                   bgcolor: isActive ? `${agent.color}05` : 'background.paper',
                   transition: 'all 0.3s',
                   '&:hover': { borderColor: agent.color, transform: 'translateX(4px)' }
                 }}
               >
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                   <Box>
                     <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem', lineHeight: 1.2 }}>
                       {agent.name}
                     </Typography>
                     <Typography variant="caption" sx={{ color: agent.color, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace' }}>
                       {agent.role.toUpperCase()}
                     </Typography>
                   </Box>
                   {log && (
                     <Chip 
                       label={`${log.status} • ${log.duration_ms}ms`} 
                       size="small" 
                       sx={{ 
                         height: 24, 
                         fontSize: '0.7rem', 
                         fontWeight: 700,
                         bgcolor: isCompleted ? 'success.soft' : 'background.paper',
                         color: isCompleted ? 'success.main' : 'text.primary',
                         border: '1px solid',
                         borderColor: isCompleted ? 'success.main' : 'divider'
                       }} 
                     />
                   )}
                 </Box>
                 
                 <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                   {agent.desc}
                 </Typography>

                 {log?.thinking && (
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'background.default', 
                      borderRadius: 2, 
                      borderLeft: '3px solid', 
                      borderColor: agent.color 
                    }}>
                      <Typography variant="caption" display="block" sx={{ color: agent.color, fontWeight: 700, mb: 0.5 }}>
                        PROCESS LOG:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        "{log.thinking}"
                      </Typography>
                    </Box>
                 )}
               </Paper>
             </Box>
           );
        })}
      </Box>
    </Box>
  );
}
