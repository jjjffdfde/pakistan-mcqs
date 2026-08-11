/* ============================================================
   Deep Knowledge KB — English Literature
   Authors, works, characters, literary devices and dates.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["english-literature"],
  chapter: "English Literature — Deep Knowledge Bank",
  tags: ["english-literature", "deep-kb", "english", "literature"],
  topics: {

    "Authors and Works": [
      {
        kind: "pair", name: "author works", a: "author", b: "famous work",
        note: "Match each author to a famous work.",
        pairs: [
          ["William Shakespeare", "Hamlet"], ["William Shakespeare", "Macbeth"], ["Charles Dickens", "A Tale of Two Cities"],
          ["Charles Dickens", "Oliver Twist"], ["Jane Austen", "Pride and Prejudice"], ["Jane Austen", "Sense and Sensibility"],
          ["George Orwell", "Animal Farm"], ["George Orwell", "Nineteen Eighty-Four"], ["John Milton", "Paradise Lost"],
          ["Geoffrey Chaucer", "The Canterbury Tales"], ["Emily Bronte", "Wuthering Heights"], ["Charlotte Bronte", "Jane Eyre"],
          ["Leo Tolstoy", "War and Peace"], ["Fyodor Dostoevsky", "Crime and Punishment"], ["Victor Hugo", "Les Miserables"],
          ["Mark Twain", "The Adventures of Huckleberry Finn"], ["Ernest Hemingway", "The Old Man and the Sea"],
          ["Herman Melville", "Moby Dick"], ["Nathaniel Hawthorne", "The Scarlet Letter"], ["J.R.R. Tolkien", "The Lord of the Rings"],
          ["C.S. Lewis", "The Chronicles of Narnia"], ["J.K. Rowling", "Harry Potter and the Philosopher's Stone"],
          ["Daniel Defoe", "Robinson Crusoe"], ["Jonathan Swift", "Gulliver's Travels"], ["Lewis Carroll", "Alice's Adventures in Wonderland"],
          ["Oscar Wilde", "The Picture of Dorian Gray"], ["Thomas Hardy", "Tess of the d'Urbervilles"],
          ["Virginia Woolf", "Mrs Dalloway"], ["James Joyce", "Ulysses"], ["D.H. Lawrence", "Sons and Lovers"],
          ["William Wordsworth", "Daffodils"], ["John Keats", "Ode to a Nightingale"], ["Percy Bysshe Shelley", "Ozymandias"],
          ["Lord Byron", "Don Juan"], ["Alexander Pope", "The Rape of the Lock"], ["Samuel Taylor Coleridge", "The Rime of the Ancient Mariner"],
          ["Robert Frost", "The Road Not Taken"], ["T.S. Eliot", "The Waste Land"], ["W.B. Yeats", "The Second Coming"],
          ["Rudyard Kipling", "The Jungle Book"], ["Joseph Conrad", "Heart of Darkness"], ["George Bernard Shaw", "Pygmalion"],
          ["Anton Chekhov", "The Cherry Orchard"], ["Henrik Ibsen", "A Doll's House"], ["Arthur Miller", "Death of a Salesman"],
          ["Tennessee Williams", "A Streetcar Named Desire"], ["Harper Lee", "To Kill a Mockingbird"], ["F. Scott Fitzgerald", "The Great Gatsby"],
          ["William Golding", "Lord of the Flies"], ["John Steinbeck", "The Grapes of Wrath"], ["Toni Morrison", "Beloved"],
          ["Gabriel Garcia Marquez", "One Hundred Years of Solitude"], ["Franz Kafka", "The Metamorphosis"],
          ["Albert Camus", "The Stranger"], ["Salman Rushdie", "Midnight's Children"], ["Chinua Achebe", "Things Fall Apart"],
          ["Allama Iqbal", "Asrar-e-Khudi"], ["Faiz Ahmed Faiz", "Dast-e-Tah-e-Sang"], ["Saadat Hasan Manto", "Toba Tek Singh"],
          ["Bapsi Sidhwa", "Cracking India"], ["Mirza Ghalib", "Diwan-e-Ghalib"], ["Naguib Mahfouz", "The Cairo Trilogy"]
        ],
        trick: "Link the author to the era of the work.",
        tip: "Classic pairings are the most tested items."
      },
      {
        kind: "pair", name: "character works", a: "character", b: "source work",
        note: "Match each character to the work they appear in.",
        pairs: [
          ["Hamlet", "Hamlet"], ["Othello", "Othello"], ["Romeo", "Romeo and Juliet"], ["King Lear", "King Lear"],
          ["Macbeth", "Macbeth"], ["Prospero", "The Tempest"], ["Shylock", "The Merchant of Venice"],
          ["Oliver Twist", "Oliver Twist"], ["Ebenezer Scrooge", "A Christmas Carol"], ["David Copperfield", "David Copperfield"],
          ["Pip", "Great Expectations"], ["Sydney Carton", "A Tale of Two Cities"], ["Mr Darcy", "Pride and Prejudice"],
          ["Elizabeth Bennet", "Pride and Prejudice"], ["Emma Woodhouse", "Emma"], ["Jane Eyre", "Jane Eyre"],
          ["Heathcliff", "Wuthering Heights"], ["Sherlock Holmes", "The Adventures of Sherlock Holmes"],
          ["Robinson Crusoe", "Robinson Crusoe"], ["Lemuel Gulliver", "Gulliver's Travels"], ["Alice", "Alice's Adventures in Wonderland"],
          ["Dorian Gray", "The Picture of Dorian Gray"], ["Atticus Finch", "To Kill a Mockingbird"], ["Jay Gatsby", "The Great Gatsby"],
          ["Holden Caulfield", "The Catcher in the Rye"], ["Ralph", "Lord of the Flies"], ["Piggy", "Lord of the Flies"],
          ["Santiago", "The Old Man and the Sea"], ["Kino", "The Pearl"], ["Gregor Samsa", "The Metamorphosis"],
          ["Meursault", "The Stranger"], ["Raskolnikov", "Crime and Punishment"], ["Anna Karenina", "Anna Karenina"],
          ["Pierre Bezukhov", "War and Peace"], ["Jean Valjean", "Les Miserables"], ["Cosette", "Les Miserables"],
          ["Scarlett O'Hara", "Gone with the Wind"], ["Huckleberry Finn", "The Adventures of Huckleberry Finn"],
          ["Tom Sawyer", "The Adventures of Tom Sawyer"], ["Captain Ahab", "Moby Dick"], ["Ishmael", "Moby Dick"],
          ["Willy Loman", "Death of a Salesman"], ["Blanche DuBois", "A Streetcar Named Desire"], ["Nora Helmer", "A Doll's House"],
          ["Major Barbara", "Major Barbara"], ["Sethe", "Beloved"], ["Saleem Sinai", "Midnight's Children"],
          ["Mowgli", "The Jungle Book"], ["Sherlock Holmes", "A Study in Scarlet"]
        ],
        trick: "Characters travel with their authors' styles.",
        tip: "Learn characters within their famous plays."
      }
    ],

    "Literary Devices and Terms": [
      {
        kind: "fact", name: "literary device definitions",
        note: "Definitions of literary devices and terms.",
        facts: [
          ["What is a metaphor?", "A direct comparison without 'like' or 'as'", "A metaphor calls one thing another directly, as in 'time is a thief', with no 'like' or 'as'."],
          ["What is a simile?", "A comparison using 'like' or 'as'", "A simile compares using 'like' or 'as', for example 'as brave as a lion' or 'swims like a fish'."],
          ["What is personification?", "Giving human qualities to non-human things", "Personification gives human traits to objects or nature, as in 'the wind whispered through the trees'."],
          ["What is alliteration?", "Repetition of initial consonant sounds", "Alliteration repeats starting consonant sounds, as in 'Peter Piper picked a peck of pickled peppers'."],
          ["What is onomatopoeia?", "Words that imitate natural sounds", "Onomatopoeia uses words that sound like their meaning, such as 'buzz', 'hiss', 'clang' and 'pop'."],
          ["What is hyperbole?", "Deliberate exaggeration for effect", "Hyperbole exaggerates for emphasis, as in 'I have told you a million times'."],
          ["What is irony?", "A contrast between expectation and reality", "Irony occurs when the actual outcome contradicts what was expected or said, often for effect."],
          ["What is a symbol?", "An object standing for a deeper idea", "A symbol is a concrete thing that represents an abstract idea, like a dove representing peace."],
          ["What is a sonnet?", "A fourteen-line poem with a fixed rhyme scheme", "A sonnet has exactly fourteen lines, typically in iambic pentameter, with a set rhyme pattern."],
          ["What is an epic?", "A long narrative poem of heroic deeds", "An epic is a long poem celebrating heroic deeds, such as 'Paradise Lost' or the 'Iliad'."],
          ["What is an ode?", "A poem of praise or reflection", "An ode is a dignified lyric poem praising a person, object or idea, as in Keats's odes."],
          ["What is a ballad?", "A narrative poem meant to be sung", "A ballad tells a story in verse, often in quatrains, originally meant for singing."],
          ["What is blank verse?", "Unrhymed verse in iambic pentameter", "Blank verse is unrhymed iambic pentameter, the metre Shakespeare uses for serious speeches."],
          ["What is free verse?", "Poetry without regular metre or rhyme", "Free verse follows no fixed metre or rhyme scheme, flowing naturally with the lines."],
          ["What is an allegory?", "A story with a hidden moral meaning", "An allegory works on two levels, with characters and events symbolising moral or political truths."],
          ["What is foreshadowing?", "Hints of events to come", "Foreshadowing plants clues early in a story that hint at later events and outcomes."],
          ["What is a flashback?", "A scene from an earlier time inserted in a story", "A flashback interrupts the present to show events from the past, explaining the current situation."],
          ["What is a protagonist?", "The main character of a story", "The protagonist is the central figure whose journey drives the plot forward."],
          ["What is an antagonist?", "The character opposing the protagonist", "The antagonist works against the main character, creating conflict and obstacles in the plot."],
          ["What is a climax?", "The point of greatest tension", "The climax is the turning point of a story where the central conflict reaches its peak."],
          ["What is a theme?", "The central idea of a work", "The theme is the underlying message or idea a work explores, such as love, justice or freedom."],
          ["What is a plot?", "The sequence of events in a story", "The plot is the ordered chain of events that builds conflict and leads to the resolution."],
          ["What is a stanza?", "A group of lines in a poem", "A stanza is a unit of lines separated by space, like a paragraph within a poem."],
          ["What is a couplet?", "Two consecutive rhyming lines", "A couplet is a pair of rhymed lines that often close a poem or sonnet with a final thought."],
          ["What is iambic pentameter?", "Five iambs per line", "Iambic pentameter lines hold five metrical feet, each an unstressed-stressed pair, as in Shakespeare."],
          ["What is an oxymoron?", "Two contradictory terms together", "An oxymoron joins opposites like 'deafening silence' or 'bitter sweet' for striking effect."],
          ["What is a paradox?", "A statement that seems contradictory yet true", "A paradox appears self-contradictory but holds truth, like 'the more things change, the more they stay the same'."],
          ["What is euphemism?", "A mild word replacing a harsh one", "Euphemism softens harsh reality, saying 'passed away' instead of 'died' or 'between jobs' instead of 'unemployed'."],
          ["What is a pun?", "A humorous play on words", "A pun exploits the double meanings of words for humour, like 'the dentist is a filling person'."],
          ["What is satire?", "Humour exposing human folly", "Satire uses wit and ridicule to expose and correct vices and foolishness in society."],
          ["What is a soliloquy?", "A speech alone on stage", "A soliloquy is a long speech delivered by a character alone, revealing private thoughts."],
          ["What is an aside?", "A short remark to the audience only", "An aside is a brief comment meant for the audience alone, unheard by the other characters."],
          ["What is a tragedy?", "A play ending in disaster for the hero", "A tragedy portrays the downfall of a noble protagonist through a fatal flaw or fate."],
          ["What is a comedy?", "A play ending happily", "Comedy presents amusing situations and ends happily, often with marriage or reconciliation."],
          ["What is a prologue?", "An introductory speech or scene", "A prologue opens a play or poem, introducing themes and characters before the action."],
          ["What is an epilogue?", "A closing speech after the main action", "An epilogue follows the story's end, drawing conclusions or addressing the audience directly."],
          ["What is the muse in poetry?", "A goddess inspiring the poet", "The muse is a classical goddess invoked by poets to inspire their verse, or any source of inspiration."],
          ["What is a refrain?", "A repeated line in a poem or song", "A refrain is a line or phrase repeated at intervals, giving a poem rhythm and unity."],
          ["What is imagery?", "Language creating vivid sensory pictures", "Imagery uses descriptive words to form mental pictures of sights, sounds, smells and touch."],
          ["What is diction?", "The poet's choice of words", "Diction is the selection of vocabulary and phrasing, shaping a work's tone and style."],
          ["What is tone?", "The author's attitude to the subject", "Tone conveys the author's attitude through word choice, whether playful, sombre, ironic or serious."],
          ["What is a monologue?", "A long speech by one character", "A monologue is an extended speech by a single character, either alone or before others."],
          ["What is a memoir?", "A personal account of one's own life", "A memoir narrates episodes from the writer's own life, focusing on memory and reflection."],
          ["What is a novel?", "A long fictional prose narrative", "A novel is an extended work of fiction in prose, with characters, plot and a developed theme."],
          ["What is a short story?", "A brief fictional prose narrative", "A short story is a compact work of fiction that develops a single effect or episode quickly."]
        ],
        trick: "Device names match the technique's effect.",
        tip: "Spot devices by their pattern, not the name."
      },
      {
        kind: "tf", name: "English literature",
        note: "Separate true literary statements from false ones.",
        statements: [
          ["Shakespeare wrote both plays and sonnets.", "Shakespeare wrote only prose novels."],
          ["'Hamlet' is a tragedy by William Shakespeare.", "'Hamlet' is a comedy by Charles Dickens."],
          ["'Paradise Lost' is an epic poem by John Milton.", "'Paradise Lost' is a novel by Jane Austen."],
          ["The sonnet traditionally has fourteen lines.", "The sonnet traditionally has twenty lines."],
          ["An epic narrates the deeds of a hero.", "An epic is a short comic essay."],
          ["Blank verse is unrhymed iambic pentameter.", "Blank verse is rhymed couplets throughout."],
          ["A simile uses 'like' or 'as' for comparison.", "A simile makes a direct comparison without 'like' or 'as'."],
          ["Personification gives human traits to objects.", "Personification compares using the word 'as'."],
          ["An allegory carries a hidden moral meaning.", "An allegory is a poem praising a king's court."],
          ["A soliloquy reveals a character's private thoughts.", "A soliloquy is a battle between two armies."],
          ["Charles Dickens wrote 'Oliver Twist'.", "Charles Dickens wrote 'Pride and Prejudice'."],
          ["George Orwell wrote 'Animal Farm'.", "George Orwell wrote 'The Canterbury Tales'."],
          ["Emily Bronte wrote 'Wuthering Heights'.", "Emily Bronte wrote 'Sense and Sensibility'."],
          ["'The Waste Land' is a poem by T.S. Eliot.", "'The Waste Land' is a novel by Mark Twain."],
          ["Allama Iqbal is a major Urdu poet.", "Allama Iqbal is a French novelist."],
          ["A theme is the central idea of a work.", "A theme is the list of characters in a play."],
          ["Foreshadowing hints at events to come.", "Foreshadowing explains events that already happened."],
          ["An oxymoron joins contradictory terms.", "An oxymoron repeats the same word twice."],
          ["'To Kill a Mockingbird' was written by Harper Lee.", "'To Kill a Mockingbird' was written by Ernest Hemingway."],
          ["An ode is a poem of praise or reflection.", "An ode is a prose legal document."]
        ],
        trick: "Verify author-work and term-meaning pairs.",
        tip: "Wrong statements usually swap authors or works."
      }
    ],

    "Literary Dates": [
      {
        kind: "numeric", name: "years between authors", difficulty: "medium",
        note: "Time gaps between the births of literary figures.",
        q: (v) => `How many years after ${v.a} was born was ${v.b} born?`,
        a: (v) => `${v.diff}`,
        e: (v) => `${v.a} was born in ${v.y1} and ${v.b} was born in ${v.y2}, so the gap between the births is ${v.diff} years.`,
        distract: (v) => [`${v.diff + 1}`, `${v.diff - 1 >= 0 ? v.diff - 1 : v.diff + 2}`, `${v.diff + 2}`, `${v.diff - 2 >= 0 ? v.diff - 2 : v.diff + 3}`, `${v.diff + 3}`],
        vals: (rng) => {
          const P = [
            ["Geoffrey Chaucer", 1343], ["William Shakespeare", 1564], ["John Milton", 1608], ["Daniel Defoe", 1660],
            ["Jonathan Swift", 1667], ["Alexander Pope", 1688], ["Samuel Johnson", 1709], ["Robert Burns", 1759],
            ["William Wordsworth", 1770], ["Samuel Taylor Coleridge", 1772], ["Jane Austen", 1775], ["Lord Byron", 1788],
            ["Percy Bysshe Shelley", 1792], ["John Keats", 1795], ["Charlotte Bronte", 1816], ["Emily Bronte", 1818],
            ["Charles Dickens", 1812], ["William Makepeace Thackeray", 1811], ["Leo Tolstoy", 1828], ["Fyodor Dostoevsky", 1821],
            ["Herman Melville", 1819], ["Walt Whitman", 1819], ["Lewis Carroll", 1832], ["Thomas Hardy", 1840],
            ["Oscar Wilde", 1854], ["George Bernard Shaw", 1856], ["Rudyard Kipling", 1865], ["W.B. Yeats", 1865],
            ["Joseph Conrad", 1857], ["Virginia Woolf", 1882], ["James Joyce", 1882], ["T.S. Eliot", 1888],
            ["F. Scott Fitzgerald", 1896], ["Ernest Hemingway", 1899], ["George Orwell", 1903], ["John Steinbeck", 1902],
            ["Robert Frost", 1874], ["J.R.R. Tolkien", 1892], ["William Golding", 1911], ["Saadat Hasan Manto", 1912],
            ["Faiz Ahmed Faiz", 1911], ["Allama Iqbal", 1877], ["Mirza Ghalib", 1797]
          ];
          let a = P[Math.floor(rng() * P.length)];
          let b = P[Math.floor(rng() * P.length)];
          while (b[1] === a[1]) b = P[Math.floor(rng() * P.length)];
          const [earlier, later] = a[1] < b[1] ? [a, b] : [b, a];
          return { a: earlier[0], y1: earlier[1], b: later[0], y2: later[1], diff: later[1] - earlier[1] };
        },
        whyWrong: (v) => [`Subtract the earlier birth year from the later one to find how many years lie between the births.`],
        trick: "later birth year minus earlier birth year.",
        tip: "Memorise the century of each major author."
      }
    ],

    "Names and Letter Counts": [
      {
        kind: "numeric", name: "author name letter totals", difficulty: "medium",
        note: "Adding the letter counts of two literary names.",
        q: (v) => `How many letters are in the names "${v.a}" and "${v.b}" combined?`,
        a: (v) => `${v.la + v.lb}`,
        e: (v) => `The name "${v.a}" contains ${v.la} letters and "${v.b}" contains ${v.lb} letters, so the two names together contain ${v.la} + ${v.lb} = ${v.la + v.lb} letters.`,
        distract: (v) => [v.la + v.lb + 1, v.la + v.lb + 2, v.la + v.lb + 3, v.la + v.lb - 1, v.la + v.lb - 2, v.la + v.lb - 3].filter((x) => x >= 1),
        vals: (rng) => {
          const W = ["Adam", "Amis", "Anne", "Behn", "Blake", "Burns", "Byron", "Camus", "Crane", "Dante", "Daud", "Donne", "Doyle", "Dryden", "Emma", "Faust", "Frost", "Gide", "Gray", "Hardy", "Harte", "Heidi", "Heine", "Hugo", "Hume", "Ibsen", "James", "Joyce", "Kafka", "Keats", "Kim", "Lamb", "Lear", "Locke", "Lyly", "Mann", "Moore", "Ovid", "Paine", "Pope", "Raine", "Scott", "Shaw", "Sidney", "Smith", "Swift", "Synge", "Twain", "Wilde", "Woolf", "Wyatt", "Yeats", "Zola", "Austen", "Beckett", "Browning", "Carroll", "Chaucer", "Chesterton", "Conrad", "Cowper", "Dickens", "Eliot", "Emerson", "Faulkner", "Fielding", "Fitzgerald", "Galsworthy", "Goldsmith", "Greene", "Hawthorne", "Hemingway", "Hopkins", "Huxley", "Johnson", "Jonson", "Kipling", "Lawrence", "Longfellow", "Marlowe", "Maugham", "Melville", "Meredith", "Milton", "Morrison", "Orwell", "Parker", "Plath", "Priestley", "Proust", "Pushkin", "Rossetti", "Ruskin", "Salinger", "Sandburg", "Sassoon", "Shakespeare", "Shelley", "Sinclair", "Spenser", "Steele", "Steinbeck", "Stevenson", "Stoker", "Tennyson", "Thackeray", "Tolstoy", "Trollope", "Updike", "Voltaire", "Walpole", "Whitman", "Wordsworth"];
          const i = Math.floor(rng() * W.length);
          let j = Math.floor(rng() * W.length);
          while (j === i) j = Math.floor(rng() * W.length);
          const [a, b] = W[i] < W[j] ? [W[i], W[j]] : [W[j], W[i]];
          return { a, b, la: a.length, lb: b.length };
        },
        whyWrong: (v) => [`Count the letters in each name separately, then add: ${v.la} + ${v.lb} = ${v.la + v.lb}.`, `Spaces between first and last names are not counted as letters.`, `Spell each author's name slowly before counting.`],
        trick: "Add the two name lengths together.",
        tip: "Count each name fully before adding."
      },
      {
        kind: "numeric", name: "author name length differences", difficulty: "medium",
        note: "Comparing the letter counts of two literary names.",
        q: (v) => `How many more letters does "${v.a}" have than "${v.b}"?`,
        a: (v) => `${v.la - v.lb}`,
        e: (v) => `The name "${v.a}" has ${v.la} letters and "${v.b}" has ${v.lb} letters, so "${v.a}" is longer by ${v.la} - ${v.lb} = ${v.la - v.lb} letters.`,
        distract: (v) => [v.la - v.lb + 1, v.la - v.lb + 2, v.la - v.lb + 3, v.la - v.lb - 1, v.la - v.lb - 2].filter((x) => x >= 1),
        vals: (rng) => {
          const LONG = ["Dryden", "Sidney", "Austen", "Beckett", "Browning", "Carroll", "Chaucer", "Chesterton", "Conrad", "Cowper", "Dickens", "Emerson", "Faulkner", "Fielding", "Fitzgerald", "Galsworthy", "Goldsmith", "Greene", "Hawthorne", "Hemingway", "Hopkins", "Huxley", "Johnson", "Jonson", "Kipling", "Lawrence", "Longfellow", "Marlowe", "Maugham", "Melville", "Meredith", "Milton", "Morrison", "Orwell", "Parker", "Priestley", "Proust", "Pushkin", "Rossetti", "Ruskin", "Salinger", "Sandburg", "Sassoon", "Shakespeare", "Shelley", "Sinclair", "Spenser", "Steele", "Steinbeck", "Stevenson", "Stoker", "Tennyson", "Thackeray", "Tolstoy", "Trollope", "Updike", "Voltaire", "Walpole", "Whitman", "Wordsworth"];
          const SHORT = ["Adam", "Amis", "Anne", "Behn", "Blake", "Burns", "Byron", "Camus", "Crane", "Dante", "Daud", "Donne", "Doyle", "Emma", "Faust", "Frost", "Gide", "Gray", "Hardy", "Harte", "Heidi", "Heine", "Hugo", "Hume", "Ibsen", "James", "Joyce", "Kafka", "Keats", "Kim", "Lamb", "Lear", "Locke", "Lyly", "Mann", "Moore", "Ovid", "Paine", "Pope", "Raine", "Scott", "Shaw", "Smith", "Swift", "Synge", "Twain", "Wilde", "Woolf", "Wyatt", "Yeats", "Zola"];
          return { a: LONG[Math.floor(rng() * LONG.length)], b: SHORT[Math.floor(rng() * SHORT.length)] };
        },
        whyWrong: (v) => [`Subtract the shorter name from the longer: ${v.la} - ${v.lb} = ${v.la - v.lb}.`, `Count the longer name first to anchor the difference.`, `The first name is always the longer one, so the difference is positive.`],
        trick: "Subtract the smaller name length.",
        tip: "Compare name lengths before subtracting."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
