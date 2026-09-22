import type { Scenario } from '../types/scenario';

/**
 * LEVEL 3 — "The Ghost Account": credential dumping leading to domain compromise.
 *
 * The scenario is built around one trap: an LSASS access event is an
 * observation, not a verdict. Everything else follows from refusing to name
 * the tool before qualifying process, account, host and time.
 *
 * External IPs use RFC 5737 documentation ranges; internal addressing is the
 * fictional CORP.LOCAL estate.
 */
export const level3: Scenario = {
  id: 'l3-ghost-account',
  code: 'LVL-03',
  difficulty: 3,
  title: {
    fr: 'Le compte fantôme',
    en: 'The ghost account',
  },
  subtitle: {
    fr: "Vol d'identifiants et compromission de domaine Active Directory",
    en: 'Credential dumping and Active Directory domain compromise',
  },
  role: {
    fr: 'Analyste L2 / Incident Responder — investigation complète',
    en: 'Tier 2 analyst / Incident Responder — full investigation',
  },
  durationMin: 28,
  tags: ['Active Directory', 'LSASS', 'T1003.001', 'Lateral movement', 'Dwell time'],

  realCase: {
    name: {
      fr: 'Cas vécu — compromission de domaine par compte résiduel',
      en: 'Field case — domain compromise through a residual account',
    },
    summary: {
      fr: "Ce niveau reprend un scénario d'intrusion classique en entreprise : un compte d'ancien salarié, désactivé mais jamais supprimé ni surveillé, réactivé discrètement par un attaquant qui disposait déjà d'identifiants de service. Le schéma — accès VPN sans authentification forte, RDP, vol d'identifiants en mémoire, rebond latéral, élévation vers Domain Admins, effacement des journaux locaux — est documenté technique par technique dans MITRE ATT&CK, et se retrouve dans la majorité des rapports de réponse à incident publiés sur les compromissions d'Active Directory. L'élément marquant ici n'est pas l'outillage, banal, mais le temps de présence : quarante et un jours entre la première activité observée et la détection.",
      en: 'This level reproduces a classic enterprise intrusion: a former employee account, disabled but never deleted or monitored, quietly re-enabled by an attacker who already held service credentials. The pattern — VPN access without strong authentication, RDP, in-memory credential theft, lateral movement, escalation to Domain Admins, local log wiping — is documented technique by technique in MITRE ATT&CK, and shows up in most published incident response reports on Active Directory compromise. The striking element here is not the tooling, which is mundane, but the dwell time: forty-one days between first observed activity and detection.',
    },
    references: [
      {
        source: 'MITRE ATT&CK',
        label: { fr: "T1003.001 — Vidage d'identifiants : mémoire LSASS", en: 'T1003.001 — OS Credential Dumping: LSASS Memory' },
        url: 'https://attack.mitre.org/techniques/T1003/001/',
      },
      {
        source: 'MITRE ATT&CK',
        label: { fr: 'T1078 — Comptes valides', en: 'T1078 — Valid Accounts' },
        url: 'https://attack.mitre.org/techniques/T1078/',
      },
      {
        source: 'MITRE ATT&CK',
        label: { fr: 'T1098 — Manipulation de compte', en: 'T1098 — Account Manipulation' },
        url: 'https://attack.mitre.org/techniques/T1098/',
      },
      {
        source: 'MITRE ATT&CK',
        label: {
          fr: "T1070.001 — Effacement des journaux d'événements Windows",
          en: 'T1070.001 — Clear Windows Event Logs',
        },
        url: 'https://attack.mitre.org/techniques/T1070/001/',
      },
    ],
  },

  environment: {
    summary: {
      fr: "Domaine Active Directory CORP.LOCAL, deux contrôleurs de domaine (DC01, DC02), environ 900 postes et une vingtaine de serveurs. Le SIEM centralise les journaux de sécurité Windows, Sysmon, Defender, la passerelle VPN, les journaux AD et le proxy/DNS. Jean Dupont a quitté l'entreprise le 5 mars 2026 ; son compte CORP\\jdupont a été désactivé mais jamais supprimé, et les journaux le mentionnant sont toujours conservés.",
      en: 'Active Directory domain CORP.LOCAL, two domain controllers (DC01, DC02), roughly 900 workstations and about twenty servers. The SIEM centralises Windows Security logs, Sysmon, Defender, the VPN gateway, AD logs and proxy/DNS. Jean Dupont left the company on 5 March 2026; his CORP\\jdupont account was disabled but never deleted, and the logs mentioning it are still retained.',
    },
    assets: [
      { name: 'DC01 / DC02', role: { fr: 'Contrôleurs de domaine CORP.LOCAL', en: 'CORP.LOCAL domain controllers' } },
      { name: 'PC-0342', role: { fr: 'Poste de travail — origine de l’alerte', en: 'Workstation — origin of the alert' } },
      { name: 'PC-0187', role: { fr: 'Poste de travail — même sous-réseau', en: 'Workstation — same subnet' } },
      { name: 'SRV-FILE01', role: { fr: 'Serveur de fichiers', en: 'File server' } },
      { name: 'SRV-APP01', role: { fr: 'Serveur applicatif métier', en: 'Line-of-business application server' } },
      { name: 'SRV-SQL01', role: { fr: 'Serveur de base de données', en: 'Database server' } },
      { name: 'CORP\\jdupont', role: { fr: 'Ancien salarié, parti le 5 mars 2026, compte désactivé', en: 'Former employee, left 5 March 2026, account disabled' } },
    ],
    telemetry: [
      { fr: 'Journaux de sécurité Windows (4624, 4625, 4648, 4672, 4688, 4698, 4722, 4725, 4728, 1102)', en: 'Windows Security logs (4624, 4625, 4648, 4672, 4688, 4698, 4722, 4725, 4728, 1102)' },
      { fr: 'Sysmon (EID 1, 3, 10, 11, 13)', en: 'Sysmon (EID 1, 3, 10, 11, 13)' },
      { fr: 'Microsoft Defender for Endpoint', en: 'Microsoft Defender for Endpoint' },
      { fr: 'Passerelle VPN', en: 'VPN gateway' },
      { fr: 'Journaux Active Directory et accès annuaire (4662)', en: 'Active Directory and directory access logs (4662)' },
      { fr: 'Proxy web et DNS', en: 'Web proxy and DNS' },
    ],
  },

  perfectBadge: 'perfect-l3',

  phases: [
    /* ---------------------------------------------------------------- */
    {
      kind: 'briefing',
      id: 'l3-brief',
      title: { fr: 'Prise de poste', en: 'Shift handover' },
      content: {
        fr: "8 h 42, mardi matin. Une alerte de sévérité ÉLEVÉE s'affiche : accès suspect au processus LSASS sur un poste de travail. LSASS, c'est le processus Windows qui détient les secrets d'authentification en mémoire — mots de passe hachés, tickets Kerberos, jetons. Toute lecture de sa mémoire par un binaire inconnu est, potentiellement, un vol d'identifiants en cours.\n\nLe réflexe, à cet instant précis, est de dire « Mimikatz ». C'est ce que dit la moitié des salles de marché de la cybersécurité devant cet événement. C'est aussi la meilleure façon de se tromper de cible, de rater l'essentiel et de rédiger un rapport qu'un client refusera de signer. Ce niveau vous demande de résister à ce réflexe pendant une heure.",
        en: 'Tuesday, 08:42. A HIGH severity alert appears: suspicious access to the LSASS process on a workstation. LSASS is the Windows process that holds authentication secrets in memory — password hashes, Kerberos tickets, tokens. Any read of its memory by an unknown binary is, potentially, credential theft in progress.\n\nThe reflex, at this exact moment, is to say "Mimikatz". Half the industry says it when they see this event. It is also the best way to aim at the wrong target, miss what matters and write a report a client will refuse to sign. This level asks you to resist that reflex for an hour.',
      },
      objectives: [
        { fr: "Qualifier l'accès LSASS sans nommer d'outil avant d'avoir des preuves.", en: 'Qualify the LSASS access without naming a tool before you have evidence.' },
        { fr: "Expliquer la présence d'un compte désactivé dans des journaux récents.", en: 'Explain a disabled account appearing in recent logs.' },
        { fr: "Reconstituer la kill chain complète, du premier accès à l'effacement des traces.", en: 'Rebuild the full kill chain, from first access to log wiping.' },
        { fr: 'Endiguer une compromission de domaine sans détruire les preuves ni la production.', en: 'Contain a domain compromise without destroying evidence or production.' },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      kind: 'alert',
      id: 'l3-triage',
      title: { fr: "Triage de l'alerte", en: 'Alert triage' },
      alert: {
        id: 'ALR-2026-0922-0004',
        ts: '2026-09-22 08:42:07',
        severity: 'high',
        source: 'Sysmon · SIEM scheduled correlation',
        rule: 'sysmon_eid10_lsass_access_from_untrusted_path',
        title: {
          fr: 'Accès suspect au processus LSASS',
          en: 'Suspicious LSASS process access',
        },
        fields: [
          { key: 'Host', value: 'PC-0342' },
          { key: 'User', value: 'CORP\\jdupont' },
          { key: 'SourceImage', value: 'C:\\Users\\Public\\suspicious.exe' },
          { key: 'TargetImage', value: 'C:\\Windows\\System32\\lsass.exe' },
          { key: 'GrantedAccess', value: '0x1010' },
          { key: 'EventID', value: '10 (Sysmon ProcessAccess)' },
          { key: 'EventTime', value: '2026-09-21 22:18:44' },
          { key: 'DetectionLatency', value: '10 h 23 — recherche corrélée planifiée (dernier passage 20:00)' },
        ],
        raw: 'Sysmon/Operational EID 10 · SourceImage=C:\\Users\\Public\\suspicious.exe SourceUser=CORP\\jdupont TargetImage=C:\\Windows\\System32\\lsass.exe GrantedAccess=0x1010 CallTrace=UNKNOWN(00007FF8…)|UNKNOWN(…)',
      },
      questions: [
        {
          id: 'l3-q-mimikatz',
          points: 15,
          prompt: {
            fr: "L'alerte indique un accès à LSASS. Quelle est votre première conclusion ?",
            en: 'The alert shows an LSASS access. What is your first conclusion?',
          },
          hint: {
            fr: "Demandez-vous ce que vous pourriez défendre devant un pair qui vous demande « qu'est-ce qui te permet de dire ça ? ».",
            en: 'Ask yourself what you could defend in front of a peer asking "what lets you say that?".',
          },
          options: [
            {
              id: 'mimikatz',
              label: {
                fr: "C'est Mimikatz : accès à LSASS avec 0x1010, le mode opératoire est connu.",
                en: 'It is Mimikatz: LSASS access with 0x1010, the modus operandi is well known.',
              },
              feedback: {
                fr: "Le masque d'accès est cohérent avec un vidage d'identifiants, mais il ne nomme aucun outil : des dizaines d'implémentations produisent la même signature, et des produits légitimes lisent aussi LSASS. Nommer l'outil trop tôt oriente toute la chasse vers de mauvais IOC.",
                en: 'The access mask is consistent with credential dumping, but it names no tool: dozens of implementations produce the same signature, and legitimate products also read LSASS. Naming the tool too early aims the entire hunt at the wrong IOCs.',
              },
            },
            {
              id: 'qualify',
              label: {
                fr: "Un accès à LSASS est une observation, pas un verdict : j'établis d'abord quel processus, sous quel compte, sur quel hôte, à quelle heure — puis je corrèle.",
                en: 'An LSASS access is an observation, not a verdict: first establish which process, under which account, on which host, at what time — then correlate.',
              },
              awardsBadge: 'not-mimikatz',
            },
            {
              id: 'av-fp',
              label: {
                fr: "Faux positif : c'est sûrement l'antivirus ou l'outil de supervision qui lit LSASS.",
                en: 'False positive: it is surely the AV or the monitoring tool reading LSASS.',
              },
              feedback: {
                fr: "Hypothèse légitime — et écartée en cinq secondes : le SourceImage est un binaire non signé situé dans C:\\Users\\Public, répertoire inscriptible par tout utilisateur. Aucun produit de sécurité ne s'installe là.",
                en: 'A legitimate hypothesis — ruled out in five seconds: the SourceImage is an unsigned binary in C:\\Users\\Public, a directory writable by any user. No security product installs there.',
              },
            },
            {
              id: 'reset-all',
              label: {
                fr: 'Je réinitialise immédiatement tous les mots de passe du domaine.',
                en: 'I immediately reset every password in the domain.',
              },
              feedback: {
                fr: "Réaction disproportionnée à ce stade : impact opérationnel massif, attaquant averti qu'il est repéré, et aucune idée du périmètre réel ni des persistances en place. On endigue après avoir cadré, pas avant.",
                en: 'Disproportionate at this stage: massive operational impact, the attacker learns they are spotted, and you still have no idea of the real scope or the persistence in place. You contain after scoping, not before.',
              },
            },
          ],
          correct: ['qualify'],
          explanation: {
            fr: "C'est le piège central de ce niveau, et il se rejoue dans la vraie vie chaque semaine. Un événement Sysmon 10 vous dit qu'un processus a ouvert un handle sur LSASS avec un certain masque d'accès. Il ne vous dit pas quel outil, ni pourquoi, ni si c'est la première fois. La séquence correcte est invariable : QUEL processus (chemin, signature, hash, parent), SOUS QUEL compte, SUR QUEL hôte, À QUELLE HEURE — et seulement ensuite, corréler avec les authentifications, les mouvements latéraux et les persistances. Ici, quatre secondes de lecture attentive donnent déjà deux anomalies majeures : un binaire dans C:\\Users\\Public, et un compte d'un salarié parti depuis six mois.",
            en: 'This is the central trap of the level, and it replays in real life every week. A Sysmon 10 event tells you a process opened a handle on LSASS with a given access mask. It does not tell you which tool, nor why, nor whether it is the first time. The correct sequence never changes: WHICH process (path, signature, hash, parent), UNDER WHICH account, ON WHICH host, AT WHAT TIME — and only then correlate with authentications, lateral movement and persistence. Here, four seconds of careful reading already yield two major anomalies: a binary in C:\\Users\\Public, and the account of an employee who left six months ago.',
          },
        },
        {
          id: 'l3-q-signals',
          points: 12,
          multi: true,
          prompt: {
            fr: "Quels éléments de cette alerte justifient de passer en investigation ?",
            en: 'Which elements of this alert justify opening an investigation?',
          },
          options: [
            {
              id: 'public-path',
              label: {
                fr: 'Le binaire se trouve dans C:\\Users\\Public, répertoire inscriptible par tous les utilisateurs',
                en: 'The binary sits in C:\\Users\\Public, a directory writable by every user',
              },
            },
            {
              id: 'granted',
              label: {
                fr: 'GrantedAccess 0x1010, qui combine la lecture de la mémoire du processus et l’interrogation d’informations',
                en: 'GrantedAccess 0x1010, combining process memory read and limited information query',
              },
            },
            {
              id: 'ghost-user',
              label: {
                fr: "Le compte CORP\\jdupont, alors que ce salarié a quitté l'entreprise en mars",
                en: 'The CORP\\jdupont account, when that employee left the company in March',
              },
              awardsBadge: 'ghost-account',
            },
            {
              id: 'unsigned',
              label: {
                fr: 'Le binaire est non signé et sa pile d’appels est illisible (CallTrace UNKNOWN)',
                en: 'The binary is unsigned and its call stack is unreadable (CallTrace UNKNOWN)',
              },
            },
            {
              id: 'lsass-system',
              label: {
                fr: 'Le fait que lsass.exe soit un processus système',
                en: 'The fact that lsass.exe is a system process',
              },
              feedback: {
                fr: "Vrai sur les neuf cents postes du parc, à chaque seconde. Une caractéristique universelle n'est jamais un indicateur.",
                en: 'True on all nine hundred endpoints, every second. A universal property is never an indicator.',
              },
            },
            {
              id: 'alert-time',
              label: {
                fr: "L'heure de l'alerte, 8 h 42, en pleine journée de travail",
                en: 'The alert time, 08:42, in the middle of the working day',
              },
              feedback: {
                fr: "Attention : 8 h 42 est l'heure de DÉTECTION, pas l'heure de l'activité. Le champ EventTime indique 21 h 18 la veille. Confondre les deux fausse toute la chronologie — et c'est exactement le type d'erreur qui fait conclure « l'attaque a commencé ce matin ».",
                en: 'Careful: 08:42 is the DETECTION time, not the activity time. The EventTime field says 22:18 the previous night. Confusing the two skews the entire timeline — and that is exactly the mistake that produces "the attack started this morning".',
              },
            },
          ],
          correct: ['public-path', 'granted', 'ghost-user', 'unsigned'],
          explanation: {
            fr: "Quatre anomalies concrètes, chacune vérifiable dans le champ correspondant. Le masque 0x1010 combine PROCESS_VM_READ et PROCESS_QUERY_LIMITED_INFORMATION : c'est la combinaison minimale pour lire le contenu de la mémoire d'un processus, et elle n'a aucune raison d'être demandée sur LSASS par un exécutable utilisateur. Les deux pièges valent d'être médités : l'un consiste à prendre une caractéristique universelle pour un signal, l'autre — bien plus coûteux — à confondre l'heure de la détection avec l'heure de l'attaque. Ce second piège vous suivra jusqu'au débrief.",
            en: 'Four concrete anomalies, each verifiable in its own field. The 0x1010 mask combines PROCESS_VM_READ and PROCESS_QUERY_LIMITED_INFORMATION: the minimum needed to read a process memory, and there is no reason for a user executable to request it on LSASS. Both traps are worth sitting with: one mistakes a universal property for a signal, the other — far more expensive — confuses detection time with attack time. That second trap will follow you all the way to the debrief.',
          },
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      kind: 'investigation',
      id: 'l3-investigation',
      title: { fr: 'Investigation', en: 'Investigation' },
      minPivots: 6,
      intro: {
        fr: "Vous avez un binaire inconnu, un compte qui ne devrait plus exister et un horodatage qui ne correspond pas à l'alerte. Neuf pistes utiles, deux impasses. Creusez dans l'ordre qui vous paraît juste : au niveau 3, personne ne vous dira quoi regarder.",
        en: 'You have an unknown binary, an account that should no longer exist and a timestamp that does not match the alert. Nine useful leads, two dead ends. Dig in whatever order feels right: at level 3, nobody tells you where to look.',
      },
      pivots: [
        {
          id: 'l3-p-proc',
          relevant: true,
          points: 12,
          label: { fr: "Remonter l'arbre de processus", en: 'Walk up the process tree' },
          rationale: {
            fr: "Un binaire ne s'exécute pas seul. Savoir qui l'a lancé vaut souvent mieux que de savoir ce qu'il est.",
            en: 'A binary does not run itself. Knowing what launched it is often worth more than knowing what it is.',
          },
          query: 'index=edr sourcetype=sysmon host=PC-0342 event_id=1 earliest="09/21/2026:22:00:00" latest="09/21/2026:23:59:00"',
          logs: [
            {
              id: 'l3-log-proc-1',
              ts: '2026-09-21 22:17:52',
              source: 'Sysmon',
              eventId: '1',
              host: 'PC-0342',
              severity: 'high',
              fields: [
                { key: 'Image', value: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe' },
                { key: 'CommandLine', value: 'powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -NoProfile' },
                { key: 'ParentImage', value: 'C:\\Windows\\explorer.exe' },
                { key: 'User', value: 'CORP\\jdupont' },
                { key: 'IntegrityLevel', value: 'High' },
                { key: 'TerminalSessionId', value: '2' },
              ],
              note: {
                fr: "Niveau d'intégrité High : la session dispose déjà de droits d'administration locale. Session 2 : ce n'est pas la console physique, c'est une session distante.",
                en: 'Integrity level High: the session already holds local administrator rights. Session 2: not the physical console, a remote session.',
              },
            },
            {
              id: 'l3-log-proc-2',
              ts: '2026-09-21 22:18:31',
              source: 'Sysmon',
              eventId: '1',
              host: 'PC-0342',
              severity: 'critical',
              fields: [
                { key: 'Image', value: 'C:\\Users\\Public\\suspicious.exe' },
                { key: 'ParentImage', value: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe' },
                { key: 'User', value: 'CORP\\jdupont' },
                { key: 'IntegrityLevel', value: 'High' },
                { key: 'SHA256', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
                { key: 'Signature', value: 'unsigned — hash inconnu du parc et des bases de réputation' },
              ],
            },
            {
              id: 'l3-log-proc-3',
              ts: '2026-09-21 22:18:44',
              source: 'Sysmon',
              eventId: '10',
              host: 'PC-0342',
              severity: 'critical',
              fields: [
                { key: 'SourceImage', value: 'C:\\Users\\Public\\suspicious.exe' },
                { key: 'TargetImage', value: 'C:\\Windows\\System32\\lsass.exe' },
                { key: 'GrantedAccess', value: '0x1010' },
                { key: 'CallTrace', value: 'UNKNOWN(00007FF8…)|UNKNOWN(…)' },
              ],
            },
          ],
          finding: {
            fr: "Chaîne établie : session distante → PowerShell avec contournement de la politique d'exécution et fenêtre masquée → binaire inconnu → lecture de la mémoire de LSASS. Toujours aucun nom d'outil, et ce n'est pas grave : la chaîne se défend sans lui.",
            en: 'Chain established: remote session → PowerShell with execution policy bypass and hidden window → unknown binary → read of LSASS memory. Still no tool name, and that is fine: the chain stands on its own.',
          },
          iocs: [
            { type: 'file', value: 'C:\\Users\\Public\\suspicious.exe' },
            { type: 'hash', value: 'e3b0c442…52b855 (SHA256)' },
          ],
        },
        {
          id: 'l3-p-ad',
          relevant: true,
          points: 16,
          awardsBadge: 'ghost-account',
          label: { fr: "Vérifier l'état du compte jdupont dans l'AD", en: 'Check the state of the jdupont account in AD' },
          rationale: {
            fr: "Un compte d'ancien salarié qui apparaît dans un événement d'hier soir : soit la donnée est fausse, soit le compte n'est pas ce qu'on croit.",
            en: 'A former employee account showing up in last night’s events: either the data is wrong, or the account is not what everyone assumes.',
          },
          query: 'index=ad user="CORP\\jdupont" (event_id=4722 OR event_id=4725 OR event_id=4738) earliest=-120d',
          logs: [
            {
              id: 'l3-log-ad-1',
              ts: '2026-09-22 08:55:00',
              source: 'Active Directory',
              severity: 'info',
              fields: [
                { key: 'samAccountName', value: 'jdupont' },
                { key: 'Disabled', value: 'TRUE' },
                { key: 'LastLogonTimestamp', value: '2026-03-04 17:42' },
                { key: 'DepartureDate', value: '2026-03-05 (RH)' },
                { key: 'pwdLastSet', value: '2025-11-18' },
                { key: 'MemberOf', value: 'Domain Users, VPN-Users, FileShare-Compta' },
                { key: 'Deleted', value: 'NO — objet conservé dans l’OU Utilisateurs' },
              ],
              note: {
                fr: "Le compte est bien désactivé aujourd'hui. Et il est toujours membre du groupe VPN-Users : la désactivation n'a jamais été accompagnée d'un vrai retrait des accès.",
                en: 'The account really is disabled today. And it is still a member of VPN-Users: disabling was never followed by an actual access removal.',
              },
            },
            {
              id: 'l3-log-ad-2',
              ts: '2026-08-12 21:58:13',
              source: 'Windows Security · DC01',
              eventId: '4722',
              severity: 'critical',
              fields: [
                { key: 'Message', value: 'A user account was enabled' },
                { key: 'TargetAccount', value: 'CORP\\jdupont' },
                { key: 'SubjectAccount', value: 'CORP\\svc_backup' },
                { key: 'SubjectLogonId', value: '0x3E7A41' },
              ],
              note: {
                fr: "Voilà l'explication : le compte a été RÉACTIVÉ le 12 août à 21 h 58 — par un compte de service, ce qui n'a aucun sens fonctionnel.",
                en: 'There is the explanation: the account was RE-ENABLED on 12 August at 21:58 — by a service account, which makes no functional sense.',
              },
            },
            {
              id: 'l3-log-ad-3',
              ts: '2026-08-13 00:12:40',
              source: 'Windows Security · DC01',
              eventId: '4725',
              severity: 'critical',
              fields: [
                { key: 'Message', value: 'A user account was disabled' },
                { key: 'TargetAccount', value: 'CORP\\jdupont' },
                { key: 'SubjectAccount', value: 'CORP\\svc_backup' },
              ],
              note: {
                fr: "Et re-désactivé deux heures plus tard, par le même compte. Le compte fantôme est allumé le temps de l'opération, puis éteint pour que l'inventaire reste propre.",
                en: 'And re-disabled two hours later, by the same account. The ghost account is switched on for the operation, then off again so the inventory stays clean.',
              },
            },
          ],
          finding: {
            fr: "Le « compte désactivé impossible » n'a rien d'impossible : il est activé à la demande. Le compte de service svc_backup dispose de droits délégués sur l'unité d'organisation des utilisateurs — il peut activer, désactiver et modifier des comptes. C'est lui, la vraie clé du royaume.",
            en: 'The "impossible disabled account" is not impossible at all: it gets enabled on demand. The svc_backup service account holds delegated rights over the users OU — it can enable, disable and modify accounts. That is the real key to the kingdom.',
          },
          iocs: [
            { type: 'account', value: 'CORP\\jdupont (réactivé/désactivé à la demande)' },
            { type: 'account', value: 'CORP\\svc_backup (compte de service sur-privilégié)' },
          ],
        },
        {
          id: 'l3-p-history',
          relevant: true,
          points: 14,
          awardsBadge: 'dwell-time',
          label: { fr: 'Chercher tout l’historique du compte dans le SIEM', en: 'Search the full account history in the SIEM' },
          rationale: {
            fr: "Avant de dater l'attaque à hier soir, il faut poser la question qui fait mal : est-ce vraiment la première fois ?",
            en: 'Before dating the attack to last night, ask the painful question: is this really the first time?',
          },
          query: 'index=* user="CORP\\jdupont" earliest=-90d | timechart span=1d count by sourcetype',
          logs: [
            {
              id: 'l3-log-hist-1',
              ts: '2026-08-12 22:04:51',
              source: 'VPN Gateway',
              severity: 'critical',
              fields: [
                { key: 'Event', value: 'Authentication success' },
                { key: 'User', value: 'CORP\\jdupont' },
                { key: 'SourceIP', value: '203.0.113.47 (hors France, fournisseur d’hébergement)' },
                { key: 'MFA', value: 'not enforced (groupe VPN-Users exempté)' },
                { key: 'Duration', value: '01:47:12' },
              ],
            },
            {
              id: 'l3-log-hist-2',
              ts: '2026-08-12 22:31:08',
              source: 'Windows Security · SRV-FILE01',
              eventId: '4624',
              severity: 'high',
              fields: [
                { key: 'LogonType', value: '3 (Network)' },
                { key: 'TargetUserName', value: 'jdupont' },
                { key: 'IpAddress', value: '10.10.24.61' },
                { key: 'AuthenticationPackage', value: 'NTLM' },
              ],
            },
            {
              id: 'l3-log-hist-3',
              ts: '2026-09-22 09:04:00',
              source: 'SIEM analytics',
              severity: 'critical',
              fields: [
                { key: 'FirstObservedActivity', value: '2026-08-12 21:58' },
                { key: 'DetectionDate', value: '2026-09-22 08:42' },
                { key: 'DwellTime', value: '41 jours' },
                { key: 'DistinctSessions', value: '6 sessions VPN entre le 12/08 et le 21/09' },
              ],
              note: {
                fr: "Six sessions en quarante et un jours. Ce n'est pas une intrusion d'hier soir : c'est une présence installée, qui a eu le temps de choisir son moment.",
                en: 'Six sessions in forty-one days. This is not last night’s intrusion: it is an established presence that had time to choose its moment.',
              },
            },
          ],
          finding: {
            fr: "Le temps de présence est d'environ quarante et un jours. L'alerte de ce matin n'est pas le début de l'attaque, c'est le moment où l'attaquant a fait assez de bruit pour déclencher une règle. Sans les anciens journaux conservés, le SOC aurait daté l'intrusion de la veille au soir — et serait passé à côté de six semaines d'activité.",
            en: 'Dwell time is roughly forty-one days. This morning’s alert is not the start of the attack, it is the moment the attacker made enough noise to trip a rule. Without the retained older logs, the SOC would have dated the intrusion to the previous evening — and missed six weeks of activity.',
          },
        },
        {
          id: 'l3-p-first-access',
          relevant: true,
          points: 14,
          label: { fr: 'Reconstituer le premier accès de la nuit', en: 'Reconstruct the first access of the night' },
          rationale: {
            fr: "Une session RDP part toujours de quelque part. Remonter jusqu'au point d'entrée réseau donne l'origine et, souvent, la faiblesse exploitée.",
            en: 'An RDP session always starts somewhere. Tracing back to the network entry point gives the origin and, usually, the weakness exploited.',
          },
          query: 'index=vpn OR index=win (user="jdupont" OR src_ip="10.10.24.87") earliest="09/21/2026:21:00:00"',
          logs: [
            {
              id: 'l3-log-fa-1',
              ts: '2026-09-21 22:13:06',
              source: 'VPN Gateway',
              severity: 'critical',
              fields: [
                { key: 'Event', value: 'Authentication success' },
                { key: 'User', value: 'CORP\\jdupont' },
                { key: 'SourceIP', value: '203.0.113.47' },
                { key: 'AssignedIP', value: '10.10.24.87' },
                { key: 'MFA', value: 'not enforced' },
                { key: 'Client', value: 'generic OpenVPN client' },
              ],
              note: {
                fr: "L'adresse 10.10.24.87 de l'alerte n'est pas un poste : c'est une adresse du pool VPN. L'attaquant est à l'extérieur.",
                en: 'The 10.10.24.87 address from the alert is not a workstation: it is a VPN pool address. The attacker is outside.',
              },
            },
            {
              id: 'l3-log-fa-2',
              ts: '2026-09-21 22:16:22',
              source: 'Windows Security · PC-0342',
              eventId: '4624',
              severity: 'critical',
              fields: [
                { key: 'LogonType', value: '10 (RemoteInteractive / RDP)' },
                { key: 'TargetUserName', value: 'jdupont' },
                { key: 'IpAddress', value: '10.10.24.87' },
                { key: 'LogonProcessName', value: 'User32' },
                { key: 'AuthenticationPackage', value: 'Negotiate' },
              ],
            },
            {
              id: 'l3-log-fa-3',
              ts: '2026-09-21 22:16:23',
              source: 'Windows Security · PC-0342',
              eventId: '4672',
              severity: 'high',
              fields: [
                { key: 'Message', value: 'Special privileges assigned to new logon' },
                { key: 'AccountName', value: 'jdupont' },
                { key: 'Privileges', value: 'SeDebugPrivilege, SeBackupPrivilege, SeTakeOwnershipPrivilege' },
              ],
              note: {
                fr: "SeDebugPrivilege sur un compte utilisateur : c'est précisément le privilège qui permet d'ouvrir la mémoire d'un processus système comme LSASS. Le compte fantôme est membre du groupe Administrateurs local du poste.",
                en: 'SeDebugPrivilege on a user account: precisely the privilege needed to open the memory of a system process such as LSASS. The ghost account is a member of the local Administrators group on this host.',
              },
            },
          ],
          finding: {
            fr: "Séquence : 22 h 13 authentification VPN depuis une adresse externe sans authentification forte, 22 h 16 session RDP sur PC-0342, privilèges spéciaux accordés dans la seconde. Deux minutes et cinquante-quatre secondes entre Internet et une session administrateur interne.",
            en: 'Sequence: 22:13 VPN authentication from an external address with no strong authentication, 22:16 RDP session on PC-0342, special privileges granted within the second. Two minutes fifty-four seconds between the internet and an internal administrator session.',
          },
          iocs: [
            { type: 'ip', value: '203.0.113.47 (source VPN externe)' },
            { type: 'ip', value: '10.10.24.87 (adresse attribuée par le VPN)' },
          ],
        },
        {
          id: 'l3-p-auth',
          relevant: true,
          points: 12,
          label: { fr: 'Passer en revue les authentifications du poste', en: 'Review the authentications on the host' },
          rationale: {
            fr: "4624 et 4672 racontent les succès ; 4625, 4648 et 4688 racontent les tentatives, les usages d'identifiants alternatifs et les exécutions. Les quatre ensemble racontent l'intention.",
            en: '4624 and 4672 tell you the successes; 4625, 4648 and 4688 tell you the attempts, the alternate credential usage and the executions. All four together tell you the intent.',
          },
          query: 'index=win host=PC-0342 event_id IN (4624,4625,4648,4688) earliest="09/21/2026:22:00:00"',
          logs: [
            {
              id: 'l3-log-auth-1',
              ts: '2026-09-21 22:21:40',
              source: 'Windows Security · PC-0342',
              eventId: '4648',
              severity: 'critical',
              fields: [
                { key: 'Message', value: 'A logon was attempted using explicit credentials' },
                { key: 'SubjectAccount', value: 'CORP\\jdupont' },
                { key: 'TargetAccount', value: 'CORP\\admin-sys' },
                { key: 'TargetServer', value: 'SRV-FILE01' },
                { key: 'ProcessName', value: 'C:\\Windows\\System32\\runas.exe' },
              ],
              note: {
                fr: "4648 est l'événement le plus sous-exploité du parc Windows : il signale l'usage d'identifiants différents de ceux de la session. Trois minutes après le vidage de LSASS, l'attaquant se sert de ce qu'il vient d'y trouver.",
                en: '4648 is the most under-used event in the Windows estate: it flags credentials different from the session ones. Three minutes after the LSASS dump, the attacker uses what they just found in it.',
              },
            },
            {
              id: 'l3-log-auth-2',
              ts: '2026-09-21 22:20:55',
              source: 'Windows Security · PC-0342',
              eventId: '4625',
              severity: 'medium',
              fields: [
                { key: 'Message', value: 'An account failed to log on' },
                { key: 'TargetUserName', value: 'admin-adm' },
                { key: 'FailureReason', value: 'Unknown user name or bad password' },
                { key: 'Count', value: '2' },
              ],
              note: {
                fr: "Deux échecs sur un nom de compte qui n'existe pas : l'attaquant teste ce qu'il a extrait, tout ne fonctionne pas. Ces échecs sont une preuve précieuse de la fenêtre d'exploitation.",
                en: 'Two failures against a non-existent account name: the attacker is testing what they extracted, and not everything works. Those failures are valuable evidence of the exploitation window.',
              },
            },
            {
              id: 'l3-log-auth-3',
              ts: '2026-09-21 22:20:02',
              source: 'Windows Security · PC-0342',
              eventId: '4688',
              severity: 'high',
              fields: [
                { key: 'NewProcessName', value: 'C:\\Users\\Public\\suspicious.exe' },
                { key: 'CreatorProcessName', value: 'powershell.exe' },
                { key: 'TokenElevationType', value: 'TokenElevationTypeFull (2)' },
                { key: 'CommandLine', value: 'suspicious.exe -o C:\\Users\\Public\\out.tmp' },
              ],
              note: {
                fr: "Le binaire écrit un fichier de sortie : le vidage d'identifiants a produit un artefact sur disque, qu'il faudra retrouver en forensique.",
                en: 'The binary writes an output file: the credential dump produced an on-disk artefact, to be recovered during forensics.',
              },
            },
          ],
          finding: {
            fr: "Le vol d'identifiants a été immédiatement exploité : échecs sur un compte inexistant, puis usage d'identifiants explicites pour admin-sys vers SRV-FILE01. La fenêtre entre le dump et la première réutilisation est de moins de trois minutes.",
            en: 'The credential theft was used immediately: failures against a non-existent account, then explicit credential usage for admin-sys towards SRV-FILE01. The window between dump and first reuse is under three minutes.',
          },
          iocs: [{ type: 'file', value: 'C:\\Users\\Public\\out.tmp' }],
        },
        {
          id: 'l3-p-accounts',
          relevant: true,
          points: 12,
          label: { fr: 'Inventorier les comptes utilisés depuis PC-0342', en: 'Inventory the accounts used from PC-0342' },
          rationale: {
            fr: "Après un vidage de LSASS, la question n'est plus « quel compte a été volé » mais « lesquels, et lequel fait le plus mal ».",
            en: 'After an LSASS dump the question is no longer "which account was stolen" but "which ones, and which one hurts most".',
          },
          query: 'index=win host=PC-0342 event_id IN (4624,4648) earliest="09/21/2026:22:00:00" | stats count by TargetUserName',
          logs: [
            {
              id: 'l3-log-acc-1',
              ts: '2026-09-22 09:12:00',
              source: 'SIEM analytics',
              severity: 'critical',
              fields: [
                { key: 'jdupont', value: 'compte fantôme — accès initial, membre du groupe Administrateurs local' },
                { key: 'svc_backup', value: 'compte de service — droits délégués sur l’OU Utilisateurs, mot de passe inchangé depuis 2023' },
                { key: 'admin-sys', value: 'compte d’administration — droits serveurs, session ouverte sur PC-0342 le 21/09 à 18:40' },
              ],
              note: {
                fr: "admin-sys avait une session ouverte sur le poste en fin de journée : ses identifiants étaient donc en mémoire dans LSASS au moment du vidage. C'est la raison d'être de la règle « pas de session d'administration sur un poste utilisateur ».",
                en: 'admin-sys had a session open on the host at the end of the day: its credentials were therefore in LSASS memory at dump time. That is the entire reason for the "no admin session on a user workstation" rule.',
              },
            },
          ],
          finding: {
            fr: "Trois comptes en jeu. Le plus dangereux est admin-sys : compte d'administration dont la session ouverte en fin de journée a laissé les secrets en mémoire, offerts au vidage de LSASS quelques heures plus tard.",
            en: 'Three accounts in play. The most dangerous is admin-sys: an administration account whose end-of-day session left its secrets in memory, handed to the LSASS dump a few hours later.',
          },
          iocs: [
            { type: 'account', value: 'CORP\\admin-sys' },
            { type: 'account', value: 'CORP\\svc_backup' },
          ],
        },
        {
          id: 'l3-p-lateral',
          relevant: true,
          points: 14,
          label: { fr: 'Suivre le mouvement latéral', en: 'Follow the lateral movement' },
          rationale: {
            fr: "Des identifiants volés ne valent que par ce qu'ils ouvrent. Il faut cartographier chaque machine atteinte avant d'endiguer, sinon on isole un poste et on laisse le reste.",
            en: 'Stolen credentials are only worth what they open. Map every machine reached before containing, otherwise you isolate one host and leave the rest.',
          },
          query: 'index=win (host=SRV-FILE01 OR host=SRV-APP01 OR host=DC01) event_id IN (4624,5140,4662) earliest="09/21/2026:22:20:00"',
          logs: [
            {
              id: 'l3-log-lat-1',
              ts: '2026-09-21 22:23:17',
              source: 'Windows Security · SRV-FILE01',
              eventId: '5140',
              severity: 'critical',
              fields: [
                { key: 'Message', value: 'A network share object was accessed' },
                { key: 'ShareName', value: '\\\\*\\ADMIN$' },
                { key: 'AccountName', value: 'admin-sys' },
                { key: 'SourceAddress', value: '10.10.24.87' },
                { key: 'AccessMask', value: 'ReadData, WriteData' },
              ],
              note: {
                fr: "Accès au partage administratif ADMIN$ : c'est le canal classique de déplacement latéral par SMB (T1021.002), et l'écriture y permet de déposer un exécutable.",
                en: 'Access to the ADMIN$ administrative share: the classic SMB lateral movement channel (T1021.002), and write access there lets you drop an executable.',
              },
            },
            {
              id: 'l3-log-lat-2',
              ts: '2026-09-21 22:31:44',
              source: 'Windows Security · SRV-APP01',
              eventId: '4624',
              severity: 'critical',
              fields: [
                { key: 'LogonType', value: '3 (Network)' },
                { key: 'TargetUserName', value: 'admin-sys' },
                { key: 'IpAddress', value: '10.10.24.87' },
                { key: 'AuthenticationPackage', value: 'NTLM' },
              ],
              note: {
                fr: "NTLM et non Kerberos : signature fréquente d'une authentification par empreinte de mot de passe réutilisée plutôt que par ticket légitime.",
                en: 'NTLM rather than Kerberos: a frequent signature of authentication with a reused password hash rather than a legitimate ticket.',
              },
            },
            {
              id: 'l3-log-lat-3',
              ts: '2026-09-21 22:42:09',
              source: 'Windows Security · DC01',
              eventId: '4662',
              severity: 'critical',
              fields: [
                { key: 'Message', value: 'An operation was performed on an object' },
                { key: 'AccountName', value: 'admin-sys' },
                { key: 'ObjectType', value: 'directoryService' },
                { key: 'Properties', value: 'Read: user objects, group objects, msDS-AllowedToDelegateTo' },
                { key: 'Volume', value: '3 812 objets énumérés en 94 s' },
              ],
              note: {
                fr: "Énumération massive de l'annuaire : l'attaquant cartographie les comptes, les groupes et les délégations. C'est la phase de reconnaissance interne qui précède le choix de la cible finale.",
                en: 'Massive directory enumeration: the attacker maps accounts, groups and delegations. This is the internal reconnaissance that precedes choosing the final target.',
              },
            },
          ],
          finding: {
            fr: "Progression nette : PC-0342 → SRV-FILE01 (SMB, 22 h 23) → SRV-APP01 (authentification distante, 22 h 31) → DC01 (énumération LDAP, 22 h 42). En vingt-neuf minutes, l'attaquant est passé d'un poste utilisateur à la lecture complète de l'annuaire.",
            en: 'Clear progression: PC-0342 → SRV-FILE01 (SMB, 22:23) → SRV-APP01 (remote authentication, 22:31) → DC01 (LDAP enumeration, 22:42). In twenty-nine minutes the attacker went from a user workstation to reading the entire directory.',
          },
        },
        {
          id: 'l3-p-persistence',
          relevant: true,
          points: 16,
          label: { fr: 'Chercher la persistance et l’élévation', en: 'Look for persistence and escalation' },
          rationale: {
            fr: "Un attaquant qui vient de prendre l'annuaire fait deux choses : il s'assure de pouvoir revenir, et il s'octroie les droits pour ne plus avoir à recommencer.",
            en: 'An attacker who just took the directory does two things: make sure they can come back, and grant themselves the rights so they never have to start over.',
          },
          query: 'index=win (event_id=4698 OR event_id=4728 OR event_id=4732) earliest="09/21/2026:22:30:00"',
          logs: [
            {
              id: 'l3-log-pers-1',
              ts: '2026-09-21 22:35:28',
              source: 'Windows Security · SRV-APP01',
              eventId: '4698',
              severity: 'critical',
              fields: [
                { key: 'Message', value: 'A scheduled task was created' },
                { key: 'TaskName', value: '\\Microsoft\\Windows\\UpdateOrchestrator\\WindowsUpdateCheck' },
                { key: 'SubjectAccount', value: 'CORP\\admin-sys' },
                { key: 'Command', value: 'C:\\ProgramData\\Microsoft\\Crypto\\upd\\wuc.exe' },
                { key: 'Trigger', value: 'AtLogon + Daily 03:00' },
                { key: 'RunAs', value: 'SYSTEM' },
              ],
              note: {
                fr: "Nom crédible, emplacement crédible, exécution en SYSTEM. Le seul détail qui trahit : aucune tâche légitime de Windows Update ne pointe vers ProgramData\\Microsoft\\Crypto.",
                en: 'Credible name, credible location, SYSTEM execution. The only giveaway: no legitimate Windows Update task points at ProgramData\\Microsoft\\Crypto.',
              },
            },
            {
              id: 'l3-log-pers-2',
              ts: '2026-09-21 22:39:51',
              source: 'Windows Security · DC01',
              eventId: '4728',
              severity: 'critical',
              fields: [
                { key: 'Message', value: 'A member was added to a security-enabled global group' },
                { key: 'Group', value: 'CORP\\Domain Admins' },
                { key: 'Member', value: 'CN=admin-sys,OU=Admins,DC=CORP,DC=LOCAL' },
                { key: 'SubjectAccount', value: 'CORP\\svc_backup' },
              ],
              note: {
                fr: "Le compte admin-sys n'était PAS administrateur du domaine avant cette nuit. C'est le point de bascule : à partir de 22 h 39, l'attaquant contrôle le domaine.",
                en: 'The admin-sys account was NOT a domain administrator before that night. This is the tipping point: from 22:39, the attacker controls the domain.',
              },
            },
          ],
          finding: {
            fr: "Persistance déguisée en tâche de mise à jour Windows s'exécutant en SYSTEM, et élévation vers Domain Admins réalisée par le compte de service. L'incident change de nature : ce n'est plus un poste compromis, c'est un domaine compromis.",
            en: 'Persistence disguised as a Windows Update task running as SYSTEM, and escalation to Domain Admins performed by the service account. The incident changes nature: this is no longer a compromised host, it is a compromised domain.',
          },
          iocs: [
            { type: 'task', value: '\\Microsoft\\Windows\\UpdateOrchestrator\\WindowsUpdateCheck' },
            { type: 'file', value: 'C:\\ProgramData\\Microsoft\\Crypto\\upd\\wuc.exe' },
          ],
        },
        {
          id: 'l3-p-antiforensics',
          relevant: true,
          points: 12,
          awardsBadge: 'siem-remembers',
          label: { fr: 'Vérifier l’intégrité des journaux locaux', en: 'Check the integrity of the local logs' },
          rationale: {
            fr: "Si l'attaquant a eu les droits SYSTEM, il a eu les droits d'effacer. Ce qui manque est une information en soi.",
            en: 'If the attacker had SYSTEM rights, they had the right to erase. What is missing is information in itself.',
          },
          query: 'index=win (event_id=1102 OR event_id=104) earliest="09/21/2026:23:00:00"',
          logs: [
            {
              id: 'l3-log-anti-1',
              ts: '2026-09-21 23:10:02',
              source: 'Windows Security · PC-0342',
              eventId: '1102',
              severity: 'critical',
              fields: [
                { key: 'Message', value: 'The audit log was cleared' },
                { key: 'SubjectAccount', value: 'CORP\\admin-sys' },
                { key: 'Channel', value: 'Security' },
              ],
            },
            {
              id: 'l3-log-anti-2',
              ts: '2026-09-21 23:10:31',
              source: 'Windows System · SRV-FILE01',
              eventId: '104',
              severity: 'critical',
              fields: [
                { key: 'Message', value: 'The System log file was cleared' },
                { key: 'SubjectAccount', value: 'CORP\\admin-sys' },
                { key: 'Channels', value: 'System, Application, Microsoft-Windows-Sysmon/Operational' },
              ],
            },
            {
              id: 'l3-log-anti-3',
              ts: '2026-09-22 09:20:00',
              source: 'SIEM integrity check',
              severity: 'info',
              fields: [
                { key: 'LocalLogs', value: 'effacés sur PC-0342 et SRV-FILE01' },
                { key: 'SIEMCopies', value: 'complètes — transfert en temps réel, 1 412 événements conservés' },
                { key: 'Gap', value: 'aucun trou dans la séquence côté SIEM' },
              ],
              note: {
                fr: "Les journaux locaux ont disparu ; les copies centralisées, non. L'effacement des traces est lui-même devenu une preuve, horodatée et attribuée à un compte.",
                en: 'The local logs are gone; the centralised copies are not. The log wiping itself became evidence, timestamped and attributed to an account.',
              },
            },
          ],
          finding: {
            fr: "Tentative d'effacement à 23 h 10 sur deux machines, sans effet sur le SIEM. C'est la justification la plus concrète qui soit de la centralisation des journaux : elle transforme une action destructrice en indicateur de compromission.",
            en: 'A wiping attempt at 23:10 on two machines, with no effect on the SIEM. This is the most concrete justification for centralised logging there is: it turns a destructive action into an indicator of compromise.',
          },
        },
        {
          id: 'l3-p-noise-av',
          relevant: false,
          points: 0,
          label: {
            fr: 'Examiner les alertes antivirus de PC-0187',
            en: 'Review the AV alerts on PC-0187',
          },
          rationale: {
            fr: 'Un poste du même sous-réseau a généré des alertes cette semaine. Lien possible ?',
            en: 'A host on the same subnet raised alerts this week. Possible link?',
          },
          query: 'index=edr sourcetype=defender host=PC-0187 earliest=-7d',
          logs: [
            {
              id: 'l3-log-noise-av',
              ts: '2026-09-20 11:22:41',
              source: 'Defender for Endpoint',
              host: 'PC-0187',
              severity: 'low',
              fields: [
                { key: 'ThreatName', value: 'PUA:Win32/Presenoker' },
                { key: 'Path', value: 'C:\\Users\\l.marchand\\Downloads\\convertisseur-pdf-gratuit.exe' },
                { key: 'Action', value: 'Blocked' },
                { key: 'User', value: 'CORP\\l.marchand' },
              ],
            },
          ],
          finding: {
            fr: "Un logiciel potentiellement indésirable téléchargé par un utilisateur, bloqué avant exécution, sans rapport avec le compte fantôme ni avec les serveurs. À traiter, mais dans une autre file.",
            en: 'A potentially unwanted program downloaded by a user, blocked before execution, unrelated to the ghost account or the servers. Worth handling, in another queue.',
          },
        },
        {
          id: 'l3-p-noise-sql',
          relevant: false,
          points: 0,
          label: {
            fr: 'Analyser le pic de trafic nocturne sur SRV-SQL01',
            en: 'Analyse the nightly traffic spike on SRV-SQL01',
          },
          rationale: {
            fr: "Un serveur de base de données qui transfère plusieurs gigaoctets la nuit, un soir d'intrusion : cela ressemble à de l'exfiltration.",
            en: 'A database server moving several gigabytes at night, on an intrusion night: that looks like exfiltration.',
          },
          query: 'index=netflow host=SRV-SQL01 earliest="09/21/2026:22:00:00" latest="09/22/2026:06:00:00"',
          logs: [
            {
              id: 'l3-log-noise-sql',
              ts: '2026-09-22 01:00:04',
              source: 'NetFlow',
              host: 'SRV-SQL01',
              severity: 'info',
              fields: [
                { key: 'Destination', value: '10.10.9.20 (SRV-BACKUP01, interne)' },
                { key: 'Volume', value: '48,2 Go' },
                { key: 'Schedule', value: 'tâche de sauvegarde quotidienne, 01:00 — identique depuis 14 mois' },
                { key: 'Account', value: 'svc_backup (usage nominal)' },
              ],
              note: {
                fr: "Destination interne, volume constant, horaire identique depuis quatorze mois : c'est la sauvegarde. À vérifier — mais à écarter ensuite.",
                en: 'Internal destination, constant volume, same schedule for fourteen months: it is the backup. Worth checking — and then ruling out.',
              },
            },
          ],
          finding: {
            fr: "Sauvegarde nocturne légitime. La vérification était justifiée ; s'y attarder ne l'est plus. Savoir écarter proprement une hypothèse fait autant partie du métier que savoir la confirmer.",
            en: 'A legitimate nightly backup. Checking was justified; dwelling on it is not. Ruling a hypothesis out cleanly is as much part of the job as confirming one.',
          },
        },
      ],
      question: {
        id: 'l3-q-ghost',
        points: 16,
        prompt: {
          fr: "Le compte jdupont est marqué Disabled dans l'AD, et pourtant il apparaît dans des événements du 12 août et de cette nuit. Quelle explication retenez-vous ?",
          en: 'The jdupont account is marked Disabled in AD, yet it appears in events from 12 August and from last night. Which explanation do you keep?',
        },
        hint: {
          fr: "Trois des quatre explications sont techniquement impossibles ou contredites par les journaux. Testez-les mentalement avant de choisir.",
          en: 'Three of the four explanations are technically impossible or contradicted by the logs. Test them mentally before choosing.',
        },
        options: [
          {
            id: 'siem-error',
            label: {
              fr: 'Une erreur de corrélation du SIEM : les journaux sont mal normalisés et attribuent les événements au mauvais compte.',
              en: 'A SIEM correlation error: the logs are badly normalised and attribute events to the wrong account.',
            },
            feedback: {
              fr: "C'est la première hypothèse à tester, parce que c'est la moins coûteuse — et la plus fréquente en vrai. Ici elle ne tient pas : quatre sources indépendantes (VPN, contrôleur de domaine, poste, Sysmon) concordent sur le même identifiant de sécurité, la même adresse et la même seconde.",
              en: 'This is the first hypothesis to test because it is the cheapest — and the most common in real life. Here it does not hold: four independent sources (VPN, domain controller, workstation, Sysmon) agree on the same security identifier, address and second.',
            },
          },
          {
            id: 'reenabled',
            label: {
              fr: 'Le compte a été réactivé temporairement puis désactivé à nouveau : il faut chercher les événements 4722 et 4725 et surtout leur auteur.',
              en: 'The account was temporarily re-enabled then disabled again: look for events 4722 and 4725, and above all for who triggered them.',
            },
            awardsBadge: 'ghost-account',
          },
          {
            id: 'kerberos',
            label: {
              fr: 'Un ticket Kerberos émis avant le départ du salarié est toujours valide.',
              en: 'A Kerberos ticket issued before the employee left is still valid.',
            },
            feedback: {
              fr: "Impossible : un ticket d'octroi de tickets a une durée de vie par défaut de dix heures, renouvelable sept jours au maximum. Six mois après, il n'existe plus. Un ticket doré, lui, survivrait — mais il exigerait déjà la compromission de krbtgt, donc du domaine entier, ce qui n'est pas établi à ce stade.",
              en: 'Impossible: a ticket-granting ticket has a ten-hour default lifetime, renewable for at most seven days. Six months later it no longer exists. A golden ticket would survive — but it would already require krbtgt, hence full domain, compromise, which is not established at this point.',
            },
          },
          {
            id: 'cached',
            label: {
              fr: 'Le poste utilise des identifiants mis en cache depuis mars.',
              en: 'The host is using credentials cached since March.',
            },
            feedback: {
              fr: "Le cache d'identifiants permet une ouverture de session locale quand le contrôleur de domaine est injoignable. Il n'explique ni une authentification VPN validée côté serveur, ni un 4624 de type 10 enregistré sur le domaine.",
              en: 'Cached credentials allow a local logon when the domain controller is unreachable. They explain neither a server-side VPN authentication nor a type 10 logon recorded on the domain.',
            },
          },
        ],
        correct: ['reenabled'],
        explanation: {
          fr: "La bonne démarche consiste à énumérer les explications possibles, puis à les éliminer avec les journaux plutôt qu'avec l'intuition. Erreur de corrélation, ticket résiduel, cache d'identifiants : trois hypothèses raisonnables, trois hypothèses réfutables en quelques requêtes. Reste la seule compatible avec les faits — la réactivation temporaire, prouvée par les événements 4722 et 4725. Et c'est son AUTEUR qui compte : le compte de service svc_backup, qui n'a aucune raison fonctionnelle d'activer des comptes utilisateurs. Le compte fantôme n'était que la façade ; le vrai problème était un compte de service sur-privilégié, dont le mot de passe n'avait pas changé depuis trois ans.",
          en: 'The right method is to enumerate the possible explanations, then eliminate them with logs rather than intuition. Correlation error, residual ticket, cached credentials: three reasonable hypotheses, three refutable in a few queries. What remains is the only one compatible with the facts — a temporary re-enable, proven by events 4722 and 4725. And it is the ACTOR that matters: the svc_backup service account, which has no functional reason to enable user accounts. The ghost account was only the shop front; the real problem was an over-privileged service account whose password had not changed in three years.',
        },
      },
    },

    /* ---------------------------------------------------------------- */
    {
      kind: 'mitre',
      id: 'l3-mitre',
      title: { fr: 'Mapping ATT&CK', en: 'ATT&CK mapping' },
      intro: {
        fr: "Dix techniques sont démontrées par vos journaux, trois ne le sont pas. Sur une compromission de domaine, ce mapping devient la colonne vertébrale du rapport : il montre la progression tactique complète, de l'accès initial à l'effacement des traces.",
        en: 'Ten techniques are demonstrated by your logs, three are not. On a domain compromise this mapping becomes the backbone of the report: it shows the full tactical progression, from initial access to log wiping.',
      },
      techniques: [
        {
          id: 'T1078',
          name: { fr: 'Comptes valides', en: 'Valid Accounts' },
          tactic: 'initial-access',
          url: 'https://attack.mitre.org/techniques/T1078/',
          observed: true,
          evidence: { fr: 'Compte jdupont réactivé puis utilisé via le VPN.', en: 'jdupont account re-enabled then used over the VPN.' },
        },
        {
          id: 'T1021.001',
          name: { fr: 'Services distants : RDP', en: 'Remote Services: Remote Desktop Protocol' },
          tactic: 'lateral-movement',
          url: 'https://attack.mitre.org/techniques/T1021/001/',
          observed: true,
          evidence: { fr: '4624 type 10 sur PC-0342 depuis 10.10.24.87 à 22:16.', en: '4624 type 10 on PC-0342 from 10.10.24.87 at 22:16.' },
        },
        {
          id: 'T1059.001',
          name: { fr: 'Interpréteur de commandes : PowerShell', en: 'Command and Scripting Interpreter: PowerShell' },
          tactic: 'execution',
          url: 'https://attack.mitre.org/techniques/T1059/001/',
          observed: true,
          evidence: { fr: 'powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden à 22:17.', en: 'powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden at 22:17.' },
        },
        {
          id: 'T1003.001',
          name: { fr: "Vidage d'identifiants : mémoire LSASS", en: 'OS Credential Dumping: LSASS Memory' },
          tactic: 'credential-access',
          url: 'https://attack.mitre.org/techniques/T1003/001/',
          observed: true,
          evidence: { fr: 'Sysmon EID 10, GrantedAccess 0x1010 sur lsass.exe à 22:18.', en: 'Sysmon EID 10, GrantedAccess 0x1010 on lsass.exe at 22:18.' },
        },
        {
          id: 'T1021.002',
          name: {
            fr: 'Services distants : partages administratifs SMB',
            en: 'Remote Services: SMB/Windows Admin Shares',
          },
          tactic: 'lateral-movement',
          url: 'https://attack.mitre.org/techniques/T1021/002/',
          observed: true,
          evidence: { fr: '5140 sur ADMIN$ de SRV-FILE01 à 22:23.', en: '5140 on ADMIN$ of SRV-FILE01 at 22:23.' },
        },
        {
          id: 'T1087.002',
          name: { fr: 'Découverte de comptes : comptes de domaine', en: 'Account Discovery: Domain Account' },
          tactic: 'discovery',
          url: 'https://attack.mitre.org/techniques/T1087/002/',
          observed: true,
          evidence: { fr: '4662 sur DC01 : 3 812 objets utilisateur et groupe énumérés.', en: '4662 on DC01: 3,812 user and group objects enumerated.' },
        },
        {
          id: 'T1069.002',
          name: {
            fr: 'Découverte de groupes de permissions : groupes de domaine',
            en: 'Permission Groups Discovery: Domain Groups',
          },
          tactic: 'discovery',
          url: 'https://attack.mitre.org/techniques/T1069/002/',
          observed: true,
          evidence: { fr: 'Lecture des objets groupe et des délégations via LDAP à 22:42.', en: 'Group objects and delegations read over LDAP at 22:42.' },
        },
        {
          id: 'T1053.005',
          name: { fr: 'Tâche planifiée', en: 'Scheduled Task/Job: Scheduled Task' },
          tactic: 'persistence',
          url: 'https://attack.mitre.org/techniques/T1053/005/',
          observed: true,
          evidence: { fr: '4698 : tâche WindowsUpdateCheck créée à 22:35, exécution SYSTEM.', en: '4698: WindowsUpdateCheck task created at 22:35, running as SYSTEM.' },
        },
        {
          id: 'T1098',
          name: { fr: 'Manipulation de compte', en: 'Account Manipulation' },
          tactic: 'privilege-escalation',
          url: 'https://attack.mitre.org/techniques/T1098/',
          observed: true,
          evidence: { fr: '4728 : admin-sys ajouté à Domain Admins à 22:39 ; 4722/4725 sur jdupont.', en: '4728: admin-sys added to Domain Admins at 22:39; 4722/4725 on jdupont.' },
        },
        {
          id: 'T1070.001',
          name: { fr: "Effacement des journaux d'événements Windows", en: 'Indicator Removal: Clear Windows Event Logs' },
          tactic: 'defense-evasion',
          url: 'https://attack.mitre.org/techniques/T1070/001/',
          observed: true,
          evidence: { fr: '1102 sur PC-0342 et 104 sur SRV-FILE01 à 23:10.', en: '1102 on PC-0342 and 104 on SRV-FILE01 at 23:10.' },
        },
        {
          id: 'T1566.001',
          name: { fr: 'Hameçonnage : pièce jointe', en: 'Phishing: Spearphishing Attachment' },
          tactic: 'initial-access',
          url: 'https://attack.mitre.org/techniques/T1566/001/',
          observed: false,
        },
        {
          id: 'T1486',
          name: { fr: 'Chiffrement de données pour impact', en: 'Data Encrypted for Impact' },
          tactic: 'impact',
          url: 'https://attack.mitre.org/techniques/T1486/',
          observed: false,
        },
        {
          id: 'T1190',
          name: { fr: "Exploitation d'une application exposée", en: 'Exploit Public-Facing Application' },
          tactic: 'initial-access',
          url: 'https://attack.mitre.org/techniques/T1190/',
          observed: false,
        },
      ],
      question: {
        id: 'l3-q-mitre',
        points: 20,
        multi: true,
        prompt: {
          fr: 'Quelles techniques vos preuves soutiennent-elles ?',
          en: 'Which techniques does your evidence support?',
        },
        options: [
          { id: 'T1078', label: { fr: 'T1078 — Comptes valides', en: 'T1078 — Valid Accounts' } },
          { id: 'T1021.001', label: { fr: 'T1021.001 — RDP', en: 'T1021.001 — RDP' } },
          { id: 'T1059.001', label: { fr: 'T1059.001 — PowerShell', en: 'T1059.001 — PowerShell' } },
          { id: 'T1003.001', label: { fr: 'T1003.001 — Mémoire LSASS', en: 'T1003.001 — LSASS Memory' } },
          { id: 'T1021.002', label: { fr: 'T1021.002 — Partages administratifs SMB', en: 'T1021.002 — SMB Admin Shares' } },
          { id: 'T1087.002', label: { fr: 'T1087.002 — Découverte de comptes', en: 'T1087.002 — Account Discovery' } },
          { id: 'T1069.002', label: { fr: 'T1069.002 — Découverte de groupes', en: 'T1069.002 — Group Discovery' } },
          { id: 'T1053.005', label: { fr: 'T1053.005 — Tâche planifiée', en: 'T1053.005 — Scheduled Task' } },
          { id: 'T1098', label: { fr: 'T1098 — Manipulation de compte', en: 'T1098 — Account Manipulation' } },
          { id: 'T1070.001', label: { fr: 'T1070.001 — Effacement des journaux', en: 'T1070.001 — Clear Windows Event Logs' } },
          {
            id: 'T1566.001',
            label: { fr: 'T1566.001 — Hameçonnage', en: 'T1566.001 — Phishing' },
            feedback: {
              fr: "Aucun mail n'apparaît dans cette chaîne. L'origine des identifiants de svc_backup reste d'ailleurs à établir : c'est une question ouverte du rapport, pas une case à cocher.",
              en: 'No email appears anywhere in this chain. The origin of the svc_backup credentials is in fact still to be established: an open question in the report, not a box to tick.',
            },
          },
          {
            id: 'T1486',
            label: { fr: 'T1486 — Chiffrement pour impact', en: 'T1486 — Data Encrypted for Impact' },
            feedback: {
              fr: "Aucun chiffrement, aucune note de rançon. L'attaquant cherchait un accès durable, pas une extorsion immédiate — ce qui est souvent pire.",
              en: 'No encryption, no ransom note. The attacker wanted durable access, not immediate extortion — which is often worse.',
            },
          },
          {
            id: 'T1190',
            label: { fr: 'T1190 — Exploitation d’application exposée', en: 'T1190 — Exploit Public-Facing Application' },
            feedback: {
              fr: "Aucune vulnérabilité n'a été exploitée : l'attaquant s'est authentifié normalement, avec des identifiants valides, sur un service prévu pour ça. C'est exactement ce qui rend ce type d'intrusion difficile à détecter.",
              en: 'No vulnerability was exploited: the attacker authenticated normally, with valid credentials, against a service designed for it. That is exactly what makes this kind of intrusion hard to detect.',
            },
          },
        ],
        correct: [
          'T1078',
          'T1021.001',
          'T1059.001',
          'T1003.001',
          'T1021.002',
          'T1087.002',
          'T1069.002',
          'T1053.005',
          'T1098',
          'T1070.001',
        ],
        explanation: {
          fr: "Dix techniques, huit tactiques, une progression lisible : accès initial par compte valide, exécution, accès aux identifiants, découverte, mouvement latéral, persistance, élévation, évasion défensive. Aucune n'est exotique, aucune n'exige d'outil rare — et c'est précisément le message à faire passer en comité : cette intrusion n'a rien d'extraordinaire, elle a seulement exploité des faiblesses ordinaires laissées en place. Les trois techniques absentes sont celles qu'on ajoute par réflexe quand on raconte une histoire plutôt que des preuves.",
          en: 'Ten techniques, eight tactics, a readable progression: initial access via a valid account, execution, credential access, discovery, lateral movement, persistence, escalation, defence evasion. None is exotic, none requires rare tooling — and that is precisely the message for the steering committee: this intrusion was unremarkable, it merely used ordinary weaknesses left in place. The three absent techniques are the ones you add by reflex when telling a story instead of presenting evidence.',
        },
      },
    },

    /* ---------------------------------------------------------------- */
    {
      kind: 'timeline',
      id: 'l3-timeline',
      title: { fr: 'Reconstruction de la kill chain', en: 'Kill chain reconstruction' },
      points: 25,
      intro: {
        fr: "Quatorze événements, de l'authentification VPN à la détection du lendemain matin. C'est la pièce maîtresse du rapport : elle montre qu'entre la première action de l'attaquant et notre première réaction, il s'est écoulé dix heures et vingt-neuf minutes.",
        en: 'Fourteen events, from the VPN authentication to the next morning’s detection. This is the centrepiece of the report: it shows that ten hours and twenty-nine minutes passed between the attacker’s first action and our first reaction.',
      },
      events: [
        { id: 'l3-t1', time: '22:13', label: { fr: 'Authentification VPN avec le compte fantôme', en: 'VPN authentication with the ghost account' } },
        { id: 'l3-t2', time: '22:16', label: { fr: 'Session RDP ouverte sur PC-0342', en: 'RDP session opened on PC-0342' } },
        { id: 'l3-t3', time: '22:17', label: { fr: 'Lancement de PowerShell avec contournement de politique', en: 'PowerShell launched with execution policy bypass' } },
        { id: 'l3-t4', time: '22:18', label: { fr: "Exécution de l'outil inconnu depuis C:\\Users\\Public", en: 'Unknown tool executed from C:\\Users\\Public' } },
        { id: 'l3-t5', time: '22:18', label: { fr: 'Accès en lecture à la mémoire de LSASS', en: 'Read access to LSASS memory' } },
        { id: 'l3-t6', time: '22:20', label: { fr: "Extraction des identifiants vers un fichier de sortie", en: 'Credentials extracted to an output file' } },
        { id: 'l3-t7', time: '22:23', label: { fr: 'Accès au partage administratif de SRV-FILE01 (SMB)', en: 'Access to the SRV-FILE01 administrative share (SMB)' } },
        { id: 'l3-t8', time: '22:31', label: { fr: 'Authentification distante sur SRV-APP01', en: 'Remote authentication on SRV-APP01' } },
        { id: 'l3-t9', time: '22:35', label: { fr: 'Création de la tâche planifiée de persistance', en: 'Persistence scheduled task created' } },
        { id: 'l3-t10', time: '22:39', label: { fr: 'Ajout du compte d’administration à Domain Admins', en: 'Administration account added to Domain Admins' } },
        { id: 'l3-t11', time: '22:42', label: { fr: "Énumération de l'annuaire depuis DC01 (LDAP)", en: 'Directory enumeration from DC01 (LDAP)' } },
        { id: 'l3-t12', time: '22:50', label: { fr: 'Activité de reconnaissance sur les serveurs', en: 'Reconnaissance activity across the servers' } },
        { id: 'l3-t13', time: '23:10', label: { fr: 'Tentative d’effacement des journaux Windows', en: 'Attempt to clear the Windows event logs' } },
        { id: 'l3-t14', time: '08:42', label: { fr: 'Détection SOC le lendemain matin', en: 'SOC detection the next morning' } },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      kind: 'decision',
      id: 'l3-decision',
      title: { fr: 'Endiguement et éradication', en: 'Containment and eradication' },
      intro: {
        fr: "Il est 9 h 30. Un compte a été ajouté à Domain Admins cette nuit et une tâche planifiée s'exécute en SYSTEM sur un serveur de production. Chaque décision qui suit a un coût — opérationnel si vous allez trop vite, sécuritaire si vous allez trop lentement.",
        en: 'It is 09:30. An account was added to Domain Admins last night and a scheduled task runs as SYSTEM on a production server. Every decision below has a cost — operational if you move too fast, security if you move too slowly.',
      },
      questions: [
        {
          id: 'l3-q-isolate',
          points: 18,
          multi: true,
          prompt: {
            fr: 'Premières actions d’endiguement : que faites-vous ?',
            en: 'First containment actions: what do you do?',
          },
          options: [
            {
              id: 'edr-isolate',
              label: {
                fr: "Isoler PC-0342 via l'EDR, machine maintenue sous tension",
                en: 'Isolate PC-0342 through the EDR, machine kept powered on',
              },
              awardsBadge: 'volatile-evidence',
            },
            {
              id: 'quarantine-srv',
              label: {
                fr: 'Mettre SRV-FILE01 et SRV-APP01 en quarantaine réseau, avec accord de l’astreinte métier',
                en: 'Place SRV-FILE01 and SRV-APP01 in network quarantine, with the business on-call’s agreement',
              },
            },
            {
              id: 'block-vpn',
              label: {
                fr: "Bloquer l'adresse source externe et suspendre l'accès VPN des comptes concernés",
                en: 'Block the external source address and suspend VPN access for the accounts involved',
              },
            },
            {
              id: 'power-off',
              label: {
                fr: "Éteindre PC-0342 pour couper l'attaquant immédiatement",
                en: 'Power PC-0342 off to cut the attacker immediately',
              },
              feedback: {
                fr: "L'extinction détruit la mémoire vive — donc les processus en cours, les connexions réseau ouvertes, les clés de chiffrement et les artefacts en mémoire de l'outil de vidage. Sur un vol d'identifiants, la RAM est souvent la seule source qui dit CE QUI a été extrait. Isoler coupe le réseau en gardant tout cela vivant.",
                en: 'Powering off destroys memory — running processes, open network connections, encryption keys and the in-memory artefacts of the dumping tool. On a credential theft, memory is often the only source that tells you WHAT was extracted. Isolation cuts the network while keeping all of it alive.',
              },
            },
            {
              id: 'unplug',
              label: {
                fr: 'Débrancher physiquement le câble réseau du poste',
                en: 'Physically unplug the workstation network cable',
              },
              feedback: {
                fr: "Cela préserve la mémoire, c'est déjà mieux que l'extinction. Mais vous perdez la télémétrie et la capacité d'agir à distance : plus de collecte, plus de commandes EDR, et personne sur place à 9 h 30. L'isolation logique fait la même chose en gardant le canal de l'EDR.",
                en: 'That preserves memory, already better than powering off. But you lose telemetry and remote action: no collection, no EDR commands, and nobody on site at 09:30. Logical isolation does the same while keeping the EDR channel.',
              },
            },
            {
              id: 'wait',
              label: {
                fr: "Ne rien faire avant l'accord écrit de la direction",
                en: 'Do nothing before written management approval',
              },
              feedback: {
                fr: "Un compte a été promu Domain Admin cette nuit : l'endiguement d'urgence relève de votre mandat, et la procédure d'incident majeur l'autorise explicitement. On informe la direction en parallèle, on ne l'attend pas.",
                en: 'An account was promoted to Domain Admin last night: emergency containment is within your mandate, and the major incident procedure explicitly allows it. You inform management in parallel, you do not wait for them.',
              },
            },
          ],
          correct: ['edr-isolate', 'quarantine-srv', 'block-vpn'],
          explanation: {
            fr: "L'endiguement d'une compromission de domaine se joue sur trois plans simultanés : les machines (isolation logique, jamais l'extinction), le chemin d'entrée (adresse source et accès VPN), et les identités (question suivante). L'ordre compte moins que la simultanéité : si vous isolez le poste mais laissez le VPN ouvert avec un compte compromis, l'attaquant revient par une autre machine dans les minutes qui suivent.",
            en: 'Containing a domain compromise happens on three fronts at once: the machines (logical isolation, never power-off), the entry path (source address and VPN access), and the identities (next question). Order matters less than simultaneity: isolate the workstation but leave the VPN open with a compromised account, and the attacker comes back through another machine within minutes.',
          },
        },
        {
          id: 'l3-q-accounts',
          points: 16,
          multi: true,
          prompt: {
            fr: 'Comment traitez-vous les comptes compromis ?',
            en: 'How do you handle the compromised accounts?',
          },
          hint: {
            fr: "Un des quatre comptes ne se traite pas comme les autres. Et il en manque un dans la liste évidente.",
            en: 'One of the four accounts is not handled like the others. And the obvious list is missing one.',
          },
          options: [
            {
              id: 'jdupont',
              label: {
                fr: 'Désactiver définitivement jdupont, en conservant l’objet AD pour l’analyse, et retirer son appartenance au groupe VPN',
                en: 'Permanently disable jdupont, keeping the AD object for analysis, and remove it from the VPN group',
              },
            },
            {
              id: 'admin-sys',
              label: {
                fr: 'Retirer admin-sys de Domain Admins, réinitialiser son mot de passe et révoquer ses sessions',
                en: 'Remove admin-sys from Domain Admins, reset its password and revoke its sessions',
              },
            },
            {
              id: 'svc-mapped',
              label: {
                fr: "Pour svc_backup : cartographier d'abord les applications et services dépendants, puis planifier la rotation du secret avec le métier",
                en: 'For svc_backup: first map the dependent applications and services, then schedule the secret rotation with the business',
              },
              awardsBadge: 'service-account-care',
            },
            {
              id: 'krbtgt',
              label: {
                fr: 'Prévoir la double rotation du compte krbtgt une fois le domaine sécurisé',
                en: 'Plan the double krbtgt rotation once the domain is secured',
              },
            },
            {
              id: 'svc-now',
              label: {
                fr: 'Réinitialiser immédiatement le mot de passe de svc_backup, sans vérification préalable',
                en: 'Reset the svc_backup password immediately, with no prior check',
              },
              feedback: {
                fr: "Tentant — et c'est souvent comme ça qu'on met les sauvegardes à l'arrêt. Un compte de service est câblé dans des services Windows, des tâches planifiées et des connecteurs applicatifs : changer le secret sans cartographie provoque une interruption, parfois découverte trois jours plus tard. Si le risque justifie l'urgence, on le fait — mais avec le métier en ligne et un plan de retour arrière.",
                en: 'Tempting — and that is exactly how backups get taken down. A service account is wired into Windows services, scheduled tasks and application connectors: rotating the secret without mapping causes an outage, sometimes discovered three days later. If the risk justifies urgency, do it — but with the business on the line and a rollback plan.',
              },
            },
            {
              id: 'reset-all',
              label: {
                fr: "Réinitialiser tous les mots de passe du domaine dans l'heure",
                en: 'Reset every password in the domain within the hour',
              },
              feedback: {
                fr: "Ingérable pour neuf cents utilisateurs, et inefficace : cela ne traite ni les tickets Kerberos en cours, ni la tâche planifiée en SYSTEM, ni le compte krbtgt. La réinitialisation massive se prépare, elle ne s'improvise pas.",
                en: 'Unmanageable for nine hundred users, and ineffective: it addresses neither in-flight Kerberos tickets, nor the SYSTEM scheduled task, nor the krbtgt account. A mass reset is planned, not improvised.',
              },
            },
          ],
          correct: ['jdupont', 'admin-sys', 'svc-mapped', 'krbtgt'],
          explanation: {
            fr: "Trois logiques différentes pour trois types de comptes. Un compte utilisateur se désactive tout de suite — mais on conserve l'objet, car sa suppression détruirait des preuves et des attributs utiles. Un compte d'administration se déprivilégie avant même d'être réinitialisé : retirer de Domain Admins est plus urgent que changer le mot de passe. Un compte de service se traite avec les dépendances en main, sous peine d'arrêter la production en croyant la protéger. Et le quatrième point est celui que l'on oublie le plus souvent : dès qu'un attaquant a atteint le niveau Domain Admin, il a pu extraire le secret du compte krbtgt et forger des tickets valides pendant des mois. Sa double rotation — deux fois, en respectant le délai de réplication — est la seule façon d'invalider ces tickets.",
            en: 'Three different logics for three kinds of account. A user account is disabled immediately — but the object is kept, since deleting it would destroy evidence and useful attributes. An administration account is de-privileged before it is even reset: removing it from Domain Admins is more urgent than changing the password. A service account is handled with its dependencies in hand, or you stop production while believing you are protecting it. And the fourth point is the most commonly forgotten: once an attacker reaches Domain Admin, they may have extracted the krbtgt secret and can forge valid tickets for months. The double rotation — twice, respecting the replication delay — is the only way to invalidate those tickets.',
          },
        },
        {
          id: 'l3-q-forensics',
          points: 14,
          multi: true,
          prompt: {
            fr: 'Que collectez-vous, et sur quelle fenêtre temporelle ?',
            en: 'What do you collect, and over what time window?',
          },
          options: [
            {
              id: 'ram',
              label: {
                fr: 'La mémoire vive de PC-0342, en priorité absolue et avant toute autre manipulation',
                en: 'The memory of PC-0342, as the absolute priority and before any other handling',
              },
            },
            {
              id: 'artefacts',
              label: {
                fr: 'Prefetch, Amcache, Shimcache, journaux d’événements, Sysmon, journaux PowerShell, tâches planifiées et ruches de registre',
                en: 'Prefetch, Amcache, Shimcache, event logs, Sysmon, PowerShell logs, scheduled tasks and registry hives',
              },
            },
            {
              id: 'window-extended',
              label: {
                fr: 'Une fenêtre SIEM de J-30 à J+1 comme point de départ, étendue dès qu’un indice antérieur apparaît',
                en: 'A SIEM window of D-30 to D+1 as a starting point, extended as soon as an earlier clue appears',
              },
            },
            {
              id: 'window-strict',
              label: {
                fr: 'Une fenêtre SIEM strictement limitée à J-30 / J+1',
                en: 'A SIEM window strictly limited to D-30 / D+1',
              },
              feedback: {
                fr: "Piège subtil, et une erreur réellement commise : la première activité date du 12 août, soit quarante et un jours avant la détection. Une fenêtre strictement limitée à trente jours s'arrête au 23 août et rate le point de départ — donc conclut que l'intrusion a commencé le 21 septembre. La fenêtre standard est un point de départ, jamais une limite.",
                en: 'A subtle trap, and a mistake genuinely made in the field: the first activity dates from 12 August, forty-one days before detection. A window strictly limited to thirty days stops on 23 August and misses the starting point — concluding the intrusion began on 21 September. The standard window is a starting point, never a boundary.',
              },
            },
            {
              id: 'logs-day',
              label: {
                fr: 'Uniquement les journaux du jour de l’alerte, pour aller vite',
                en: 'Only the logs from the day of the alert, to move fast',
              },
              feedback: {
                fr: "Vous dateriez l'intrusion de la veille au soir et vous rateriez six semaines de présence, la réactivation du compte et l'origine réelle de la compromission.",
                en: 'You would date the intrusion to the previous evening and miss six weeks of presence, the account re-enable and the real origin of the compromise.',
              },
            },
          ],
          correct: ['ram', 'artefacts', 'window-extended'],
          explanation: {
            fr: "L'ordre de collecte suit la volatilité : la mémoire d'abord, parce qu'elle disparaît au moindre redémarrage et qu'elle contient ici l'outil de vidage et, potentiellement, les identifiants extraits. Viennent ensuite les artefacts d'exécution (Prefetch, Amcache, Shimcache), qui survivent à l'effacement des journaux et permettent de prouver qu'un binaire a tourné même si tout le reste a été nettoyé. Enfin, la fenêtre temporelle : trente jours en arrière est une convention raisonnable pour commencer, mais dès qu'un événement antérieur apparaît — ici le 12 août — la fenêtre doit suivre la preuve, pas la procédure.",
            en: 'Collection order follows volatility: memory first, because it vanishes at the slightest reboot and here contains the dumping tool and potentially the extracted credentials. Then the execution artefacts (Prefetch, Amcache, Shimcache), which survive log wiping and prove a binary ran even when everything else was cleaned. Finally the time window: thirty days back is a reasonable convention to start with, but as soon as an earlier event appears — here 12 August — the window must follow the evidence, not the procedure.',
          },
        },
        {
          id: 'l3-q-qualify',
          points: 14,
          prompt: {
            fr: 'Comment qualifiez-vous et escaladez-vous cet incident ?',
            en: 'How do you classify and escalate this incident?',
          },
          options: [
            {
              id: 'major',
              label: {
                fr: "Incident majeur — compromission de domaine : activation de la cellule de crise, information de la direction, préparation d'un plan de reconstruction de l'AD.",
                en: 'Major incident — domain compromise: activate the crisis unit, inform management, prepare an AD rebuild plan.',
              },
            },
            {
              id: 'workstation',
              label: {
                fr: 'Incident poste de travail, traitement en L1 avec réinstallation de PC-0342.',
                en: 'Workstation incident, Tier 1 handling with a reimage of PC-0342.',
              },
              feedback: {
                fr: "Un compte a été ajouté à Domain Admins et une tâche s'exécute en SYSTEM sur un serveur. Le périmètre est le domaine, pas le poste.",
                en: 'An account was added to Domain Admins and a task runs as SYSTEM on a server. The scope is the domain, not the workstation.',
              },
            },
            {
              id: 'breach-notify',
              label: {
                fr: 'Violation de données : notification immédiate à l’autorité de contrôle.',
                en: 'Data breach: immediate notification to the regulator.',
              },
              feedback: {
                fr: "Rien ne prouve encore une exfiltration de données personnelles : on observe de l'énumération d'annuaire et du mouvement latéral. La notification se décide sur des faits qualifiés — tout en gardant le délai réglementaire en ligne de mire et en associant le juridique dès maintenant.",
                en: 'Nothing yet proves personal data exfiltration: what is observed is directory enumeration and lateral movement. Notification is decided on qualified facts — while keeping the regulatory deadline in sight and bringing legal in right now.',
              },
            },
            {
              id: 'wait-forensics',
              label: {
                fr: "Attendre la fin de l'analyse forensique avant toute communication.",
                en: 'Wait for the forensic analysis to finish before communicating anything.',
              },
              feedback: {
                fr: "L'analyse prendra des jours ; l'attaquant, lui, a un accès Domain Admin maintenant. Communication et analyse sont parallèles, jamais séquentielles.",
                en: 'The analysis will take days; the attacker has Domain Admin access now. Communication and analysis run in parallel, never in sequence.',
              },
            },
          ],
          correct: ['major'],
          explanation: {
            fr: "Le seuil est objectif : dès qu'un compte non légitime obtient des droits d'administration du domaine, on est en incident majeur, quelle que soit l'ampleur apparente. Cela déclenche trois choses en parallèle — l'endiguement technique, l'information de la direction et du juridique, et la préparation d'un plan de reconstruction (qui peut aller jusqu'à la reconstruction de la forêt selon les conclusions). La qualification n'est pas une formalité administrative : c'est elle qui débloque les moyens, les autorisations d'interruption de service et les ressources externes.",
            en: 'The threshold is objective: the moment an illegitimate account obtains domain administration rights, it is a major incident, whatever the apparent scale. That triggers three things in parallel — technical containment, informing management and legal, and preparing a rebuild plan (which may go as far as forest rebuild depending on the findings). Classification is not administrative paperwork: it is what unlocks the budget, the service interruption authorisations and the external resources.',
          },
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      kind: 'debrief',
      id: 'l3-debrief',
      title: { fr: 'Débrief', en: 'Debrief' },
      summary: {
        fr: "Une alerte d'accès à LSASS a révélé une compromission complète du domaine CORP.LOCAL, préparée depuis quarante et un jours. L'attaquant n'a exploité aucune vulnérabilité : il s'est authentifié, avec des identifiants valides, sur des services prévus pour l'accès distant. Le seul outil inhabituel du scénario est un binaire de vidage d'identifiants de quelques centaines de kilo-octets. Tout le reste — VPN, RDP, SMB, LDAP, tâches planifiées, groupes AD — fait partie du fonctionnement normal d'un système d'information.",
        en: 'One LSASS access alert revealed a complete compromise of the CORP.LOCAL domain, prepared over forty-one days. The attacker exploited no vulnerability: they authenticated, with valid credentials, against services designed for remote access. The only unusual tool in the whole scenario is a few-hundred-kilobyte credential dumping binary. Everything else — VPN, RDP, SMB, LDAP, scheduled tasks, AD groups — is part of how an information system normally works.',
      },
      facts: [
        { label: { fr: 'Classification', en: 'Classification' }, value: { fr: "Compromission d'identifiants / vidage LSASS — compromission de domaine", en: 'Credential compromise / LSASS dumping — domain compromise' } },
        { label: { fr: 'Sévérité', en: 'Severity' }, value: { fr: 'Critique', en: 'Critical' } },
        { label: { fr: 'Temps de présence', en: 'Dwell time' }, value: { fr: '≈ 41 jours (12 août → 22 septembre)', en: '≈ 41 days (12 August → 22 September)' } },
        { label: { fr: 'Latence de détection', en: 'Detection latency' }, value: { fr: '10 h 23 entre l’événement et l’alerte (recherche planifiée)', en: '10 h 23 between event and alert (scheduled search)' } },
        { label: { fr: 'Systèmes touchés', en: 'Systems affected' }, value: { fr: 'PC-0342, SRV-FILE01, SRV-APP01, DC01 (énumération)', en: 'PC-0342, SRV-FILE01, SRV-APP01, DC01 (enumeration)' } },
        { label: { fr: 'Comptes compromis', en: 'Compromised accounts' }, value: { fr: 'jdupont (fantôme), svc_backup (service), admin-sys (administration)', en: 'jdupont (ghost), svc_backup (service), admin-sys (administration)' } },
        { label: { fr: 'Point de bascule', en: 'Tipping point' }, value: { fr: '21/09 à 22 h 39 — ajout à Domain Admins', en: '21/09 at 22:39 — added to Domain Admins' } },
        { label: { fr: 'Question ouverte', en: 'Open question' }, value: { fr: "Origine des identifiants de svc_backup avant le 12 août — analyse en cours", en: 'Origin of the svc_backup credentials before 12 August — analysis ongoing' } },
      ],
      lessons: [
        {
          fr: "Ne jamais partir de « c'est Mimikatz » sur un seul événement LSASS. Établissez d'abord le processus, le compte, l'hôte et l'heure, puis corrélez avec les authentifications, les mouvements latéraux et les persistances. Le nom de l'outil est la dernière chose utile — et souvent celle qu'on ne saura jamais avec certitude.",
          en: 'Never start from "it is Mimikatz" on a single LSASS event. Establish the process, the account, the host and the time first, then correlate with authentications, lateral movement and persistence. The tool name is the last useful thing — and often the one you will never know for sure.',
        },
        {
          fr: "Le SIEM centralisé bat l'effacement des journaux locaux. C'est exactement pour cette nuit-là qu'on centralise : à 23 h 10, l'attaquant a effacé les journaux de deux machines, et il n'a rien effacé du tout.",
          en: 'A centralised SIEM beats local log wiping. That night is precisely why you centralise: at 23:10 the attacker cleared the logs on two machines, and erased nothing at all.',
        },
        {
          fr: "L'ancien compte désactivé était l'indice historique qui a révélé que l'attaque avait commencé des semaines plus tôt. Sans les anciens journaux, le SOC aurait cru que tout commençait le matin même — et aurait endigué un incident de douze heures au lieu d'un incident de six semaines.",
          en: 'The old disabled account was the historical clue that revealed the attack had started weeks earlier. Without the retained logs, the SOC would have believed it all began that morning — and would have contained a twelve-hour incident instead of a six-week one.',
        },
        {
          fr: "Une session d'administration ouverte sur un poste utilisateur en fin de journée, c'est un mot de passe d'administrateur déposé en mémoire pour la nuit. Le tiering Active Directory n'est pas une lubie d'architecte : c'est ce qui aurait rendu ce vidage de LSASS sans valeur.",
          en: 'An administration session left open on a user workstation at the end of the day is an admin password deposited in memory for the night. Active Directory tiering is not an architect’s whim: it is what would have made this LSASS dump worthless.',
        },
      ],
      rootCause: [
        { fr: "Offboarding incomplet : compte d'ancien salarié désactivé mais jamais supprimé, toujours membre du groupe VPN, jamais surveillé.", en: 'Incomplete offboarding: former employee account disabled but never deleted, still in the VPN group, never monitored.' },
        { fr: 'Compte de service sur-privilégié (droits délégués d’activation et de modification de comptes) avec un mot de passe inchangé depuis trois ans.', en: 'Over-privileged service account (delegated rights to enable and modify accounts) with a password unchanged for three years.' },
        { fr: 'Absence d’authentification multifacteur sur le VPN pour certains groupes.', en: 'No multi-factor authentication on the VPN for some groups.' },
        { fr: "Absence de tiering AD : session d'administration ouverte sur un poste utilisateur.", en: 'No AD tiering: an administration session open on a user workstation.' },
        { fr: 'Corrélation de détection insuffisante : chaque événement pris isolément était sous le seuil d’alerte.', en: 'Insufficient detection correlation: every event taken in isolation sat below the alerting threshold.' },
        { fr: 'Détection en recherche planifiée plutôt qu’en temps réel — dix heures de latence.', en: 'Detection via scheduled search rather than real time — ten hours of latency.' },
        { fr: 'Segmentation réseau trop permissive entre postes et serveurs (SMB, RDP ouverts).', en: 'Over-permissive network segmentation between workstations and servers (SMB, RDP open).' },
        { fr: 'Journaux locaux manipulables par un compte administrateur local.', en: 'Local logs modifiable by a local administrator account.' },
      ],
      remediation: [
        { fr: 'Automatiser l’offboarding : désactivation, retrait de tous les groupes, suppression planifiée, et alerte sur tout usage d’un compte inactif depuis plus de 30 jours.', en: 'Automate offboarding: disable, remove from all groups, scheduled deletion, and alert on any use of an account inactive for more than 30 days.' },
        { fr: 'MFA obligatoire sur tous les accès distants, sans exemption de groupe.', en: 'Mandatory MFA on all remote access, with no group exemptions.' },
        { fr: 'Moindre privilège et tiering AD : comptes d’administration réservés aux machines d’administration, interdiction de session admin sur un poste utilisateur.', en: 'Least privilege and AD tiering: administration accounts restricted to admin workstations, no admin sessions on user endpoints.' },
        { fr: 'Comptes de service : droits minimaux, secrets gérés par coffre-fort, rotation automatisée, et revue annuelle des délégations sur les OU.', en: 'Service accounts: minimal rights, vault-managed secrets, automated rotation, and an annual review of OU delegations.' },
        { fr: 'Activer la protection LSASS (RunAsPPL, Credential Guard) et la journalisation PowerShell complète (4104, transcription).', en: 'Enable LSASS protection (RunAsPPL, Credential Guard) and full PowerShell logging (4104, transcription).' },
        { fr: 'Segmenter SMB et RDP entre zones, et interdire les flux poste → serveur non nécessaires.', en: 'Segment SMB and RDP between zones, and block unnecessary workstation → server flows.' },
        { fr: 'Détection corrélée en temps réel : accès LSASS + PowerShell suspect + compte inactif ou ancien + RDP inhabituel = CRITIQUE, escalade immédiate.', en: 'Real-time correlated detection: LSASS access + suspicious PowerShell + dormant or former account + unusual RDP = CRITICAL, immediate escalation.' },
        { fr: 'Alerter sur 4722, 4725, 4728 et 1102 : activation de compte, désactivation, ajout à un groupe privilégié, effacement de journal.', en: 'Alert on 4722, 4725, 4728 and 1102: account enable, disable, privileged group addition, log clearing.' },
      ],
      report: {
        fr: "INC-2026-0922-03 — Compromission de domaine CORP.LOCAL par vol d'identifiants.\nDétection : alerte Sysmon EID 10 (accès LSASS, GrantedAccess 0x1010) sur PC-0342 remontée à 08:42 le 22/09, pour un événement survenu à 22:18 le 21/09 — latence de 10 h 23 liée à une recherche corrélée planifiée.\nChaîne : 22:13 authentification VPN du compte jdupont (ancien salarié, sans MFA) depuis 203.0.113.47 → 22:16 session RDP sur PC-0342 avec privilèges d'administration locale → 22:17 PowerShell avec contournement de politique → 22:18 exécution de C:\\Users\\Public\\suspicious.exe et lecture de la mémoire de LSASS → 22:20 extraction des identifiants → 22:23 SMB vers SRV-FILE01 (ADMIN$) → 22:31 authentification distante sur SRV-APP01 → 22:35 tâche planifiée de persistance en SYSTEM → 22:39 ajout de admin-sys à Domain Admins par svc_backup → 22:42 énumération LDAP de 3 812 objets sur DC01 → 23:10 tentative d'effacement des journaux, sans effet sur le SIEM.\nAntériorité : le compte jdupont a été réactivé le 12/08 à 21:58 puis désactivé le 13/08 à 00:12 par svc_backup ; six sessions VPN entre le 12/08 et le 21/09. Temps de présence estimé : 41 jours.\nEndiguement : isolation EDR de PC-0342 sans extinction, quarantaine de SRV-FILE01 et SRV-APP01, blocage de l'adresse source et suspension des accès VPN, retrait de admin-sys de Domain Admins, désactivation définitive de jdupont, rotation planifiée de svc_backup après cartographie des dépendances, double rotation de krbtgt.\nForensique : acquisition mémoire de PC-0342 en priorité, puis Prefetch, Amcache, Shimcache, ruches de registre, journaux Sysmon et PowerShell, tâches planifiées ; fenêtre SIEM élargie au-delà de 30 jours pour couvrir le 12 août.\nQuestion ouverte : origine des identifiants svc_backup avant le 12/08.",
        en: "INC-2026-0922-03 — CORP.LOCAL domain compromise through credential theft.\nDetection: Sysmon EID 10 alert (LSASS access, GrantedAccess 0x1010) on PC-0342 raised at 08:42 on 22/09, for an event that occurred at 22:18 on 21/09 — 10 h 23 latency caused by a scheduled correlation search.\nChain: 22:13 VPN authentication of the jdupont account (former employee, no MFA) from 203.0.113.47 → 22:16 RDP session on PC-0342 with local administrator privileges → 22:17 PowerShell with execution policy bypass → 22:18 execution of C:\\Users\\Public\\suspicious.exe and read of LSASS memory → 22:20 credential extraction → 22:23 SMB to SRV-FILE01 (ADMIN$) → 22:31 remote authentication on SRV-APP01 → 22:35 SYSTEM persistence scheduled task → 22:39 admin-sys added to Domain Admins by svc_backup → 22:42 LDAP enumeration of 3,812 objects on DC01 → 23:10 log wiping attempt, with no effect on the SIEM.\nPrior activity: the jdupont account was re-enabled on 12/08 at 21:58 then disabled on 13/08 at 00:12 by svc_backup; six VPN sessions between 12/08 and 21/09. Estimated dwell time: 41 days.\nContainment: EDR isolation of PC-0342 without power-off, quarantine of SRV-FILE01 and SRV-APP01, source address blocking and VPN access suspension, removal of admin-sys from Domain Admins, permanent disabling of jdupont, scheduled svc_backup rotation after dependency mapping, double krbtgt rotation.\nForensics: memory acquisition of PC-0342 first, then Prefetch, Amcache, Shimcache, registry hives, Sysmon and PowerShell logs, scheduled tasks; SIEM window extended beyond 30 days to cover 12 August.\nOpen question: origin of the svc_backup credentials before 12/08.",
      },
    },
  ],
};
