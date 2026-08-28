import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ShoppingBag,
  Check,
  Lock,
  Eye,
  Star,
  Zap,
  CheckCircle2,
  Shield,
  Palette,
  User,
  Sliders,
  AlertCircle,
  Flame,
} from 'lucide-react';
import { PlayerSkinsConfig, PlayerStats, SkinCategory, SkinItem } from '../types';
import { ALL_SKINS, getEquippedSkins, getSkinById } from '../utils/skinsData';
import { buyPlayerSkin, equipPlayerSkin } from '../utils/storage';
import { playClick, playCorrect, playLevelUp, playWrong } from '../utils/audio';

interface SkinShopViewProps {
  stats: PlayerStats;
  skinsConfig: PlayerSkinsConfig;
  onStatsUpdated: (newStats: PlayerStats) => void;
  onSkinsUpdated: (newConfig: PlayerSkinsConfig) => void;
  onPlayGame: () => void;
}

export const SkinShopView: React.FC<SkinShopViewProps> = ({
  stats,
  skinsConfig,
  onStatsUpdated,
  onSkinsUpdated,
  onPlayGame,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | SkinCategory>('all');
  const [previewSkinId, setPreviewSkinId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Active equipped skins
  const equipped = getEquippedSkins(skinsConfig);

  // If a preview is active, override preview display
  const previewSkin = previewSkinId ? getSkinById(previewSkinId) : null;
  const effectiveTheme = (previewSkin?.category === 'theme' ? previewSkin : equipped.theme);
  const effectiveAvatar = (previewSkin?.category === 'avatar' ? previewSkin : equipped.avatar);
  const effectiveCardFrame = (previewSkin?.category === 'cardFrame' ? previewSkin : equipped.cardFrame);
  const effectiveButtonStyle = (previewSkin?.category === 'buttonStyle' ? previewSkin : equipped.buttonStyle);

  // Filter skins
  const filteredSkins = ALL_SKINS.filter((skin) => {
    if (selectedCategory === 'all') return true;
    return skin.category === selectedCategory;
  });

  const handleBuy = (skin: SkinItem) => {
    playClick();
    const result = buyPlayerSkin(skin.id, skin.price, skin.category);

    if (result.success) {
      if (result.updatedStats) onStatsUpdated(result.updatedStats);
      if (result.updatedSkins) onSkinsUpdated(result.updatedSkins);

      playLevelUp();
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // safe
      }

      setNotification({
        text: `"${skin.nameUz}" muvaffaqiyatli xarid qilindi va kiyildi!`,
        type: 'success',
      });
      setTimeout(() => setNotification(null), 3500);
    } else {
      playWrong();
      setNotification({
        text: result.message,
        type: 'error',
      });
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const handleEquip = (skin: SkinItem) => {
    playCorrect();
    const updated = equipPlayerSkin(skin.id, skin.category);
    onSkinsUpdated(updated);

    setNotification({
      text: `"${skin.nameUz}" faollashtirildi!`,
      type: 'success',
    });
    setTimeout(() => setNotification(null), 2500);
  };

  const isEquipped = (skin: SkinItem) => {
    if (skin.category === 'theme') return skinsConfig.equippedTheme === skin.id;
    if (skin.category === 'avatar') return skinsConfig.equippedAvatar === skin.id;
    if (skin.category === 'cardFrame') return skinsConfig.equippedCardFrame === skin.id;
    if (skin.category === 'buttonStyle') return skinsConfig.equippedButtonStyle === skin.id;
    return false;
  };

  const isUnlocked = (skin: SkinItem) => {
    return skin.price === 0 || skinsConfig.unlockedSkinIds.includes(skin.id);
  };

  return (
    <div id="skin-shop-container" className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Shop Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-purple-950/80 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl mb-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-1.5 shadow-sm">
                <ShoppingBag className="w-3.5 h-3.5" /> Rasmiy Skinlar Do'koni
              </span>
              <span className="text-purple-300 text-xs font-semibold">24+ ta eksklyuziv uslub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              O'yiningizni Shaxsiylashtiring
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Misollarni yechib to'plagan ballaringiz evaziga qiziqarli mavzular, qahramonlar, neon ramkalar va tugma uslublarini sotib oling!
            </p>
          </div>

          {/* Current Ball Balance & Play Button */}
          <div className="bg-slate-900/95 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl self-stretch lg:self-auto min-w-[300px]">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/20 animate-pulse-subtle">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] uppercase font-bold text-slate-400">Mavjud Ballaringiz</div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 leading-tight">
                  {stats.totalScore.toLocaleString()} <span className="text-sm font-bold text-amber-300/80">Ball</span>
                </div>
              </div>
            </div>

            <button
              id="btn-shop-play"
              onClick={() => {
                playClick();
                onPlayGame();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>O'yinga O'tish</span>
            </button>
          </div>
        </div>

        {/* Floating Notification */}
        {notification && (
          <div
            className={`mt-4 p-3 rounded-xl border flex items-center gap-2 text-xs sm:text-sm font-bold animate-fade-in ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500 text-rose-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
        )}
      </div>

      {/* Live Interactive Preview Box */}
      <div className="mb-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-extrabold text-white">Jonli Ko'rinish Simulyatori</h3>
            {previewSkin && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 animate-pulse">
                Sinov ko'rish: {previewSkin.nameUz}
              </span>
            )}
          </div>
          {previewSkin && (
            <button
              onClick={() => setPreviewSkinId(null)}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Asl holatga qaytarish
            </button>
          )}
        </div>

        {/* Simulated Game Board with active skins */}
        <div
          className={`p-4 sm:p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
            effectiveTheme.themeStyles?.boardBackground || 'bg-slate-900'
          } ${effectiveTheme.themeStyles?.boardBorder || 'border-slate-800'}`}
        >
          {/* Simulated HUD */}
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{effectiveAvatar.avatarData?.emoji || '🤖'}</span>
              <div>
                <div className="text-xs font-black text-white">
                  {effectiveAvatar.avatarData?.badgeText || 'Kiber Bot'}
                </div>
                <div className="text-[10px] text-slate-400">Mavzu: {effectiveTheme.nameUz}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-amber-400 font-black text-xs border border-slate-700">
                1,250 Ball
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-400 font-black text-xs border border-orange-500/30 flex items-center gap-1">
                <Flame className="w-3 h-3" /> 5x Combo
              </span>
            </div>
          </div>

          {/* Simulated Math Problem Card */}
          <div
            className={`p-5 rounded-2xl text-center mb-4 transition-all duration-300 ${
              effectiveCardFrame.cardStyles?.borderClass || 'border border-slate-700'
            } ${effectiveCardFrame.cardStyles?.glowShadowClass || 'shadow-lg'} ${
              effectiveCardFrame.cardStyles?.innerCardBg || 'bg-slate-950/80'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Namuna Misol
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wider">
              12 × 8 = ?
            </div>
          </div>

          {/* Simulated Answer Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[86, 96, 98, 104].map((opt, i) => {
              const isExampleCorrect = opt === 96;
              return (
                <div
                  key={i}
                  className={`py-3 px-2 rounded-xl text-center text-sm font-extrabold transition-all select-none cursor-pointer ${
                    isExampleCorrect
                      ? effectiveButtonStyle.buttonStyles?.correctClass || 'bg-emerald-500 text-slate-950'
                      : effectiveButtonStyle.buttonStyles?.baseClass || 'bg-slate-800 text-white'
                  }`}
                >
                  <span className="mr-1.5 opacity-70 font-mono text-xs">{['A', 'B', 'C', 'D'][i]}:</span>
                  <span>{opt}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        <button
          onClick={() => {
            playClick();
            setSelectedCategory('all');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Barchasi ({ALL_SKINS.length})</span>
        </button>

        <button
          onClick={() => {
            playClick();
            setSelectedCategory('theme');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
            selectedCategory === 'theme'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Mavzular (7)</span>
        </button>

        <button
          onClick={() => {
            playClick();
            setSelectedCategory('avatar');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
            selectedCategory === 'avatar'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Qahramonlar (7)</span>
        </button>

        <button
          onClick={() => {
            playClick();
            setSelectedCategory('cardFrame');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
            selectedCategory === 'cardFrame'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Ramkalar & Aura (6)</span>
        </button>

        <button
          onClick={() => {
            playClick();
            setSelectedCategory('buttonStyle');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
            selectedCategory === 'buttonStyle'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tugmalar Uslubi (4)</span>
        </button>
      </div>

      {/* Grid of Skins */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSkins.map((skin) => {
          const unlocked = isUnlocked(skin);
          const equippedNow = isEquipped(skin);
          const canAfford = stats.totalScore >= skin.price;
          const isPreviewing = previewSkinId === skin.id;

          return (
            <div
              key={skin.id}
              id={`skin-card-${skin.id}`}
              className={`rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between p-5 relative ${
                equippedNow
                  ? 'bg-slate-800/95 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : unlocked
                  ? 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
                  : 'bg-slate-900/90 border-slate-800/90'
              }`}
            >
              {/* Top Row: Icon + Badges */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${skin.previewGradient} border border-slate-700/80 flex items-center justify-center text-3xl shadow-lg relative`}
                  >
                    <span>{skin.icon}</span>
                    {equippedNow && (
                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {equippedNow ? (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Kiyilgan
                      </span>
                    ) : unlocked ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-[11px] uppercase tracking-wider">
                        Ochilgan
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-amber-500/40 text-amber-400 font-black text-xs shadow-inner">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{skin.price.toLocaleString()} ball</span>
                      </div>
                    )}

                    {skin.tag && (
                      <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-900/60">
                        {skin.tag}
                      </span>
                    )}
                  </div>
                </div>

                {/* Skin Info */}
                <h4 className="text-lg font-black text-white leading-snug">{skin.nameUz}</h4>
                <div className="text-xs text-amber-400/80 font-mono mb-2">{skin.name}</div>
                <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                  {skin.description}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="mt-5 pt-3.5 border-t border-slate-700/60 flex items-center gap-2">
                {/* Preview Button */}
                <button
                  id={`btn-preview-skin-${skin.id}`}
                  onClick={() => {
                    playClick();
                    setPreviewSkinId(previewSkinId === skin.id ? null : skin.id);
                  }}
                  title="Simulyatorda ko'rish"
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center ${
                    isPreviewing
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                </button>

                {/* Main Action Button */}
                {equippedNow ? (
                  <button
                    disabled
                    className="flex-1 py-2.5 rounded-xl bg-slate-700/50 text-slate-400 font-extrabold text-xs cursor-default flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Faol Holatda</span>
                  </button>
                ) : unlocked ? (
                  <button
                    id={`btn-equip-skin-${skin.id}`}
                    onClick={() => handleEquip(skin)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Kiyish</span>
                  </button>
                ) : (
                  <button
                    id={`btn-buy-skin-${skin.id}`}
                    onClick={() => handleBuy(skin)}
                    disabled={!canAfford}
                    className={`flex-1 py-2.5 rounded-xl font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Sotib Olish ({skin.price} ball)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Yetmaydi (-{skin.price - stats.totalScore} ball)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
