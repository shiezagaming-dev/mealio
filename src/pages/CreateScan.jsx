import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Camera, Refrigerator, ListPlus, PlusCircle } from 'lucide-react';
import AmbientBackground from '../components/AmbientBackground';

export default function CreateScan() {
  const { t } = useApp();
  const navigate = useNavigate();

  const options = [
    { 
      id: 'snap', 
      title: t('createScan.snapTitle'), 
      desc: t('createScan.snapDesc'), 
      icon: Camera, 
      color: 'var(--accent)', 
      path: '/create/snap' 
    },
    { 
      id: 'fridge', 
      title: t('createScan.fridgeTitle'), 
      desc: t('createScan.fridgeDesc'), 
      icon: Refrigerator, 
      color: '#4CAF50', 
      path: '/create/fridge' 
    },
    { 
      id: 'ingredients', 
      title: t('createScan.ingredientsTitle'), 
      desc: t('createScan.ingredientsDesc'), 
      icon: ListPlus, 
      color: '#FFC107', 
      path: '/create/ingredients' 
    },
    { 
      id: 'create', 
      title: t('createScan.recipeTitle'), 
      desc: t('createScan.recipeDesc'), 
      icon: PlusCircle, 
      color: '#2196F3', 
      path: '/create/recipe' 
    },
  ];

  return (
    <div className="screen" style={{ position: 'relative', width: '100%', backgroundColor: 'transparent' }}>
      <AmbientBackground />
      
      <div style={{ position: 'relative', zIndex: 1, padding: '20px 0' }}>
        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: 'var(--fs-h1)', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {t('createScan.hubTitle')}
          </h1>
        </header>

        <main style={{ padding: '0 var(--padding-screen)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button 
                key={opt.id}
                onClick={() => navigate(opt.path)}
                style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '24px 16px', borderRadius: 'var(--r-lg)', 
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  gap: '12px', textAlign: 'center'
                }}
                className="hub-card"
              >
                <div style={{ 
                  padding: '12px', borderRadius: '50%', 
                  background: `${opt.color}20`, color: opt.color 
                }}>
                  <Icon size={32} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px' }}>
                    {opt.title}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.2' }}>
                    {opt.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </main>
      </div>
    </div>
  );
}
