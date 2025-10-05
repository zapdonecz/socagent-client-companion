import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { getTasks, saveTask, deleteTask } from '@/lib/extendedStorage';
import { getClients } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth';
import { Task, Client } from '@/types';
import { format, differenceInDays } from 'date-fns';
import { cs } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Tasks() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'done'>('todo');
  const [dueDate, setDueDate] = useState('');
  const [selectedClient, setSelectedClient] = useState('');

  useEffect(() => {
    loadTasks();
    setClients(getClients());
  }, []);

  const loadTasks = () => {
    setTasks(getTasks());
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    setDueDate('');
    setSelectedClient('');
    setEditingTask(null);
  };

  const handleOpenDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate || '');
      setSelectedClient(task.clientId || 'none');
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSaveTask = () => {
    if (!title.trim()) {
      toast({
        title: 'Chyba',
        description: 'Název úkolu je povinný',
        variant: 'destructive',
      });
      return;
    }

    const task: Task = {
      id: editingTask?.id || Date.now().toString(),
      title,
      description: description || undefined,
      priority,
      status,
      dueDate: dueDate || undefined,
      clientId: selectedClient && selectedClient !== 'none' ? selectedClient : undefined,
      clientName: selectedClient && selectedClient !== 'none' ? clients.find(c => c.id === selectedClient)?.firstName + ' ' + clients.find(c => c.id === selectedClient)?.lastName : undefined,
      assignedTo: user?.id,
      createdBy: editingTask?.createdBy || user?.id || '',
      createdAt: editingTask?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: status === 'done' && !editingTask?.completedAt ? new Date().toISOString() : editingTask?.completedAt,
    };

    saveTask(task);
    loadTasks();
    setDialogOpen(false);
    resetForm();
    
    toast({
      title: editingTask ? 'Úkol aktualizován' : 'Úkol vytvořen',
      description: editingTask ? 'Změny byly uloženy' : 'Nový úkol byl přidán',
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Opravdu chcete smazat tento úkol?')) {
      deleteTask(taskId);
      loadTasks();
      toast({
        title: 'Úkol smazán',
        description: 'Úkol byl úspěšně odstraněn',
      });
    }
  };

  const handleToggleStatus = (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in-progress' : 'done';
    saveTask({
      ...task,
      status: newStatus,
      completedAt: newStatus === 'done' ? new Date().toISOString() : undefined,
    });
    loadTasks();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Vysoká';
      case 'medium': return 'Střední';
      case 'low': return 'Nízká';
      default: return priority;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'todo': return <Circle className="h-4 w-4 text-muted-foreground" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'done': return 'Hotovo';
      case 'in-progress': return 'Probíhá';
      case 'todo': return 'Čeká';
      default: return status;
    }
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const doneTasks = tasks.filter(t => t.status === 'done');
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    return differenceInDays(new Date(t.dueDate), new Date()) < 0;
  });

  const renderTaskCard = (task: Task) => {
    const isOverdue = task.dueDate && task.status !== 'done' && differenceInDays(new Date(task.dueDate), new Date()) < 0;
    const daysUntilDue = task.dueDate ? differenceInDays(new Date(task.dueDate), new Date()) : null;

    return (
      <Card key={task.id} className={isOverdue ? 'border-destructive' : ''}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => handleToggleStatus(task)}>
                  {getStatusIcon(task.status)}
                </button>
                <h4 className={`font-semibold ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </h4>
                <Badge variant={getPriorityColor(task.priority)}>
                  {getPriorityLabel(task.priority)}
                </Badge>
              </div>
              
              {task.description && (
                <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
              )}
              
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {task.clientName && (
                  <span 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => task.clientId && navigate(`/clients/${task.clientId}`)}
                  >
                    👤 {task.clientName}
                  </span>
                )}
                {task.dueDate && (
                  <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                    {isOverdue && <AlertCircle className="h-3 w-3 inline mr-1" />}
                    📅 {format(new Date(task.dueDate), 'dd. MM. yyyy', { locale: cs })}
                    {daysUntilDue !== null && daysUntilDue >= 0 && ` (${daysUntilDue}d)`}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenDialog(task)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteTask(task.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">Úkoly</h2>
          <p className="text-muted-foreground">Správa úkolů a ToDo seznamu</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nový úkol
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Čeká na zpracování</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todoTasks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Probíhá</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{inProgressTasks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Po termínu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueTasks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Hotovo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{doneTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks by Status */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Všechny ({tasks.length})</TabsTrigger>
          <TabsTrigger value="todo">Čeká ({todoTasks.length})</TabsTrigger>
          <TabsTrigger value="in-progress">Probíhá ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="overdue">Po termínu ({overdueTasks.length})</TabsTrigger>
          <TabsTrigger value="done">Hotovo ({doneTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Zatím nemáte žádné úkoly</p>
              </CardContent>
            </Card>
          ) : (
            tasks.map(renderTaskCard)
          )}
        </TabsContent>

        <TabsContent value="todo" className="space-y-3">
          {todoTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Žádné čekající úkoly</p>
              </CardContent>
            </Card>
          ) : (
            todoTasks.map(renderTaskCard)
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-3">
          {inProgressTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Žádné probíhající úkoly</p>
              </CardContent>
            </Card>
          ) : (
            inProgressTasks.map(renderTaskCard)
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-3">
          {overdueTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Žádné úkoly po termínu 🎉</p>
              </CardContent>
            </Card>
          ) : (
            overdueTasks.map(renderTaskCard)
          )}
        </TabsContent>

        <TabsContent value="done" className="space-y-3">
          {doneTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Žádné dokončené úkoly</p>
              </CardContent>
            </Card>
          ) : (
            doneTasks.map(renderTaskCard)
          )}
        </TabsContent>
      </Tabs>

      {/* Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Upravit úkol' : 'Nový úkol'}</DialogTitle>
            <DialogDescription>
              {editingTask ? 'Upravte detaily úkolu' : 'Vytvořte nový úkol'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Název úkolu *</Label>
              <Input
                id="title"
                placeholder="Co je třeba udělat..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Popis</Label>
              <Textarea
                id="description"
                placeholder="Podrobnosti k úkolu..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priorita</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Nízká</SelectItem>
                    <SelectItem value="medium">Střední</SelectItem>
                    <SelectItem value="high">Vysoká</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Stav</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Čeká</SelectItem>
                    <SelectItem value="in-progress">Probíhá</SelectItem>
                    <SelectItem value="done">Hotovo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Termín</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Klient</Label>
                <Select value={selectedClient || 'none'} onValueChange={setSelectedClient}>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Bez klienta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Bez klienta</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Zrušit
              </Button>
              <Button onClick={handleSaveTask}>
                {editingTask ? 'Uložit změny' : 'Vytvořit úkol'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
