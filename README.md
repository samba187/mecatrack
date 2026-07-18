# Mécatrack

SaaS de suivi de réparation en temps réel pour garages automobiles indépendants.
Le garagiste gère ses dossiers ; le client suit sa réparation via un lien unique
(photos, statuts, devis signés en ligne, messagerie), sans compte ni application.

**Stack :** Next.js 14 (App Router) · Supabase (BDD, Auth, Storage) · Stripe · Twilio · Resend · Tailwind CSS

## Démarrage rapide (mode démo)

```bash
npm install
npm run dev
```

Sans aucune clé configurée, l'application démarre en **mode démo** :

- Données fictives en mémoire (Garage Lemoine, 6 dossiers réalistes)
- Authentification désactivée (le bouton « Se connecter » entre directement)
- Page de suivi client d'exemple : `http://localhost:3000/suivi/demo`
- Les SMS/emails sont journalisés dans la console au lieu d'être envoyés
- Le paiement Stripe est simulé

C'est aussi l'environnement idéal pour **faire une démonstration à un garagiste**.

## Passage en production

1. **Supabase** : créer un projet, exécuter `supabase/schema.sql` dans le SQL
   Editor, puis renseigner les 3 variables `SUPABASE`. Désactiver la
   confirmation d'email dans Auth → Settings si vous voulez une inscription
   immédiate.
2. **Stripe** : créer deux produits (« Mécatrack Essentiel » 19 €/mois,
   « Mécatrack Pro » 39 €/mois), renseigner les `STRIPE_PRICE_ID_*`, la clé
   secrète, et configurer le webhook `https://votredomaine/api/webhooks/stripe`
   (événements : `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`,
   `invoice.payment_failed`).
3. **Twilio** : un numéro SMS français, renseigner les 3 variables `TWILIO`.
4. **Resend** : vérifier le domaine d'envoi, renseigner `RESEND_API_KEY` et `EMAIL_FROM`.
5. **Vercel** : déployer, définir `NEXT_PUBLIC_APP_URL` sur le domaine final.

Dès que `NEXT_PUBLIC_SUPABASE_URL` est présent, le mode démo se coupe
automatiquement et l'application utilise les vrais services.

## Modèle tarifaire

| Formule | Prix | Contenu |
|---|---|---|
| Essai | 14 jours gratuits | Toutes les fonctionnalités Pro, sans carte bancaire |
| Essentiel | 19 €/mois | Dossiers illimités, suivi, photos (10/dossier), devis signés, messagerie |
| Pro | 39 €/mois | + SMS automatiques, 20 photos/dossier, logo, retrait du branding |

À l'expiration de l'essai sans abonnement : compte en lecture seule
(les dossiers restent consultables, la création est suspendue).

## Structure

```
app/
  page.tsx               Landing page
  auth/                  Connexion, inscription, mot de passe
  dashboard/
    dossiers/            Liste, création, détail dossier
    compte/              Infos garage + abonnement
  suivi/[token]/         Page publique client (sans auth)
  api/stripe/            Checkout + portail
  api/webhooks/stripe/   Webhooks abonnement
components/              UI, dashboard, suivi, landing
lib/
  db.ts                  Couche données unifiée (démo ↔ Supabase)
  demo/                  Store en mémoire du mode démo
  plans.ts               Formules et limites
  notifications.ts       SMS Twilio + emails Resend
supabase/schema.sql      Schéma complet + RLS + bucket photos
```
