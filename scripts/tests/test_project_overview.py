import json
import tempfile
import unittest
from pathlib import Path

from scripts.project_overview import (
    collect_overview,
    count_kotlin_class_declarations,
    count_kotlin_tests,
    count_typescript_class_declarations,
    count_typescript_tests,
    parse_jacoco_line_coverage,
    parse_vitest_line_coverage,
)


class ProjectOverviewTest(unittest.TestCase):
    def test_counts_kotlin_class_declarations(self) -> None:
        source = """
        data class Rating(val value: Int)
        sealed class Command
        enum class FeedSortOrder { NEWEST }
        value class UserId(val value: String)
        object HiddenSingleton
        interface IgnoredPort
        """

        self.assertEqual(count_kotlin_class_declarations(source), 4)

    def test_counts_typescript_class_declarations(self) -> None:
        source = """
        export class HeroCard {}
        abstract class BasePresenter {}
        interface FeedViewModel {}
        type Owner = { name: string };
        """

        self.assertEqual(count_typescript_class_declarations(source), 2)

    def test_counts_test_declarations(self) -> None:
        kotlin_tests = """
        @Test
        fun createsPost() = Unit

        @Test
        fun deletesPost() = Unit
        """
        ts_tests = """
        it('renders cards', () => {})
        test.only('loads settings', () => {})
        test.describe('group', () => {})
        """

        self.assertEqual(count_kotlin_tests(kotlin_tests), 2)
        self.assertEqual(count_typescript_tests(ts_tests), 2)

    def test_parses_coverage_reports(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            jacoco_path = temp_path / 'jacoco.xml'
            jacoco_path.write_text(
                '<report><counter type="LINE" missed="20" covered="80" /></report>',
                encoding='utf-8',
            )
            vitest_path = temp_path / 'coverage-summary.json'
            vitest_path.write_text(
                json.dumps(
                    {
                        'total': {
                            'lines': {
                                'total': 50,
                                'covered': 40,
                                'pct': 80,
                            }
                        }
                    }
                ),
                encoding='utf-8',
            )

            jacoco = parse_jacoco_line_coverage(jacoco_path)
            vitest = parse_vitest_line_coverage(vitest_path)

            self.assertEqual(jacoco['total'], 100)
            self.assertEqual(jacoco['covered'], 80)
            self.assertEqual(jacoco['pct'], 80.0)
            self.assertEqual(vitest['total'], 50)
            self.assertEqual(vitest['covered'], 40)
            self.assertEqual(vitest['pct'], 80.0)

    def test_collects_overview_from_repository_fixture(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir)
            (repo_root / 'backend/src/main/kotlin/com/example').mkdir(parents=True)
            (repo_root / 'backend/src/test/kotlin/com/example').mkdir(parents=True)
            (repo_root / 'frontend/src/features/sample').mkdir(parents=True)
            (repo_root / 'frontend/coverage').mkdir(parents=True)
            (repo_root / 'backend/build/reports/jacoco/test').mkdir(parents=True)

            (repo_root / 'backend/src/main/kotlin/com/example/Sample.kt').write_text(
                'data class Sample(val id: String)\nclass SampleService\n',
                encoding='utf-8',
            )
            (repo_root / 'backend/src/test/kotlin/com/example/SampleTest.kt').write_text(
                '@Test\nfun sampleTest() = Unit\n',
                encoding='utf-8',
            )
            (repo_root / 'backend/src/test/kotlin/com/example/TestFixtures.kt').write_text(
                'object TestFixtures\n',
                encoding='utf-8',
            )
            (repo_root / 'frontend/src/features/sample/HeroCard.tsx').write_text(
                'export class HeroCard {}\n',
                encoding='utf-8',
            )
            (repo_root / 'frontend/src/features/sample/HeroCard.spec.tsx').write_text(
                "it('renders', () => {})\n",
                encoding='utf-8',
            )
            (repo_root / 'frontend/coverage/coverage-summary.json').write_text(
                json.dumps(
                    {
                        'total': {
                            'lines': {
                                'total': 40,
                                'covered': 30,
                                'pct': 75,
                            }
                        }
                    }
                ),
                encoding='utf-8',
            )
            (repo_root / 'backend/build/reports/jacoco/test/jacocoTestReport.xml').write_text(
                '<report><counter type="LINE" missed="10" covered="30" /></report>',
                encoding='utf-8',
            )

            overview = collect_overview(repo_root)

            self.assertEqual(overview['source']['kotlin']['files'], 1)
            self.assertEqual(overview['source']['kotlin']['classes'], 2)
            self.assertEqual(overview['source']['typescript']['files'], 1)
            self.assertEqual(overview['source']['typescript']['classes'], 1)
            self.assertEqual(overview['tests']['backend']['declared'], 1)
            self.assertEqual(overview['tests']['backend']['files'], 1)
            self.assertEqual(overview['tests']['frontend']['declared'], 1)
            self.assertEqual(overview['tests']['total']['declared'], 2)
            self.assertAlmostEqual(overview['coverage']['combined']['pct'], 75.0)


if __name__ == '__main__':
    unittest.main()

